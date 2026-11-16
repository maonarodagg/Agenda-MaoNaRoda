-- Troca do login Google por e-mail + senha.
-- Com e-mail/senha, o e-mail só prova quem a pessoa é depois de confirmado.
-- Por isso o dono só é reconhecido com email_confirmed_at preenchido.

-- E-mail do usuário logado, só se já foi confirmado.
create function private.confirmed_email()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select lower(email)
  from auth.users
  where id = auth.uid() and email_confirmed_at is not null;
$$;

revoke all on function private.confirmed_email() from public, anon;
grant execute on function private.confirmed_email() to authenticated;

create or replace function public.get_access_state()
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    return 'no_access';
  end if;

  if private.is_member() then
    return 'member';
  end if;

  if not exists (select 1 from public.team)
     and private.confirmed_email() = (select lower(owner_email) from public.app_config) then
    return 'can_create_team';
  end if;

  return 'no_access';
end;
$$;

create or replace function public.create_team(p_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_team_id uuid;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  if private.confirmed_email() is distinct from (select lower(owner_email) from public.app_config) then
    raise exception 'not_allowed';
  end if;

  if exists (select 1 from public.team) then
    raise exception 'team_exists';
  end if;

  insert into public.team (name, owner_id) values (trim(p_name), v_uid) returning id into v_team_id;
  insert into public.team_members (user_id) values (v_uid);

  return v_team_id;
end;
$$;

-- Convite também exige e-mail confirmado (defesa extra: sem confirmação nem há sessão).
create or replace function public.accept_invite(p_token text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_invite public.invites%rowtype;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  if private.confirmed_email() is null then
    raise exception 'email_not_confirmed';
  end if;

  if private.is_member() then
    return 'already_member';
  end if;

  select * into v_invite
  from public.invites
  where token_hash = encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex')
  for update;

  if not found then
    return 'invalid';
  elsif v_invite.revoked_at is not null then
    return 'revoked';
  elsif v_invite.used_at is not null then
    return 'used';
  elsif v_invite.expires_at <= now() then
    return 'expired';
  end if;

  insert into public.team_members (user_id) values (v_uid);
  update public.invites set used_at = now(), used_by = v_uid where id = v_invite.id;

  return 'ok';
end;
$$;

-- Nome vem do formulário de cadastro (metadata full_name); sem foto.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    null
  );
  return new;
end;
$$;
