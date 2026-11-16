-- Fase 1: perfis, equipe única, membros e convites por link.
-- Regra: toda tabela com RLS. Escritas sensíveis só via funções (RPC) que validam auth.uid().

-- Schema privado pras funções auxiliares (não fica exposto na API).
create schema if not exists private;
grant usage on schema private to authenticated;

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------

-- Só nome, e-mail e foto do Google (RNF-02).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Configuração única: e-mail de quem pode criar a equipe.
create table public.app_config (
  id boolean primary key default true check (id),
  owner_email text not null
);

insert into public.app_config (owner_email) values ('maonaroda.gg@gmail.com');

-- Uma equipe só (coluna singleton com unique).
create table public.team (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true unique check (singleton),
  name text not null check (char_length(trim(name)) between 1 and 80),
  owner_id uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.team_members (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now()
);

-- Guardamos só o hash do token; o link aparece uma vez pra quem gerou.
create table public.invites (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  used_at timestamptz,
  used_by uuid references public.profiles (id) on delete set null,
  revoked_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Perfil criado automaticamente no primeiro login
-- ---------------------------------------------------------------------------

create function private.handle_new_user()
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
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------------------------------------------------------------------------
-- Funções auxiliares (security definer pra não cair em recursão de RLS)
-- ---------------------------------------------------------------------------

create function private.is_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.team_members where user_id = auth.uid());
$$;

create function private.is_team_member(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.team_members where user_id = p_user_id);
$$;

create function private.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.team t
    join public.team_members m on m.user_id = t.owner_id
    where t.owner_id = auth.uid()
  );
$$;

revoke all on all functions in schema private from public, anon;
grant execute on function private.is_member(), private.is_team_member(uuid), private.is_owner() to authenticated;

-- ---------------------------------------------------------------------------
-- RLS e permissões
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.app_config enable row level security;
alter table public.team enable row level security;
alter table public.team_members enable row level security;
alter table public.invites enable row level security;

-- anon não acessa nada; authenticated só lê, as escritas passam pelas RPCs.
revoke all on public.profiles, public.app_config, public.team, public.team_members, public.invites
  from anon, authenticated;

grant select on public.profiles, public.team, public.team_members to authenticated;
grant delete on public.team_members to authenticated;
-- token_hash fica fora do select.
grant select (id, created_by, created_at, expires_at, used_at, used_by, revoked_at)
  on public.invites to authenticated;

-- Perfil: o próprio, ou perfis de membros se eu for membro.
create policy "profiles: ver o próprio ou de membros"
  on public.profiles for select to authenticated
  using (id = auth.uid() or (private.is_member() and private.is_team_member(id)));

create policy "team: membros veem"
  on public.team for select to authenticated
  using (private.is_member());

create policy "team_members: membros veem"
  on public.team_members for select to authenticated
  using (private.is_member());

-- Só o dono remove, e não pode remover a si mesmo.
create policy "team_members: dono remove outros"
  on public.team_members for delete to authenticated
  using (private.is_owner() and user_id <> auth.uid());

create policy "invites: membros veem"
  on public.invites for select to authenticated
  using (private.is_member());

-- ---------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------

-- Estado de acesso do usuário logado: 'member', 'can_create_team' ou 'no_access'.
create function public.get_access_state()
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_email text;
begin
  if auth.uid() is null then
    return 'no_access';
  end if;

  if private.is_member() then
    return 'member';
  end if;

  select email into v_email from auth.users where id = auth.uid();

  if not exists (select 1 from public.team)
     and lower(v_email) = (select lower(owner_email) from public.app_config) then
    return 'can_create_team';
  end if;

  return 'no_access';
end;
$$;

-- Cria a equipe. Só o e-mail configurado, e só se ainda não existir equipe.
create function public.create_team(p_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_team_id uuid;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select email into v_email from auth.users where id = v_uid;

  if lower(v_email) is distinct from (select lower(owner_email) from public.app_config) then
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

-- Gera convite e devolve o token puro (só esta vez).
create function public.create_invite()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token text;
begin
  if not private.is_member() then
    raise exception 'not_member';
  end if;

  v_token := encode(extensions.gen_random_bytes(24), 'hex');

  insert into public.invites (token_hash, created_by)
  values (encode(extensions.digest(v_token, 'sha256'), 'hex'), auth.uid());

  return v_token;
end;
$$;

-- Usa o convite. Devolve: ok, invalid, expired, used, revoked ou already_member.
create function public.accept_invite(p_token text)
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

-- Revoga convite pendente. Qualquer membro pode (RF-03).
create function public.revoke_invite(p_invite_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_member() then
    raise exception 'not_member';
  end if;

  update public.invites
  set revoked_at = now()
  where id = p_invite_id and used_at is null and revoked_at is null;

  if not found then
    raise exception 'invite_not_pending';
  end if;
end;
$$;

revoke all on function
  public.get_access_state(),
  public.create_team(text),
  public.create_invite(),
  public.accept_invite(text),
  public.revoke_invite(uuid)
  from public, anon;

grant execute on function
  public.get_access_state(),
  public.create_team(text),
  public.create_invite(),
  public.accept_invite(text),
  public.revoke_invite(uuid)
  to authenticated;
