-- Testes de RLS/RPC da equipe e dos convites.
-- Usuários: dono (e-mail configurado), B (entra por convite) e X (estranho, sem convite).
begin;
create extension if not exists pgtap with schema extensions;

select plan(31);

-- Helpers de teste (somem no rollback)
create schema tests;
grant usage on schema tests to anon, authenticated;

create function tests.create_user(p_id uuid, p_email text, p_name text) returns void
language sql as $$
  insert into auth.users (id, email, raw_user_meta_data, aud, role)
  values (p_id, p_email, jsonb_build_object('full_name', p_name), 'authenticated', 'authenticated');
$$;

create function tests.login_as(p_id uuid) returns void
language sql as $$
  select set_config('role', 'authenticated', true);
  select set_config('request.jwt.claims', json_build_object('sub', p_id, 'role', 'authenticated')::text, true);
$$;

create function tests.login_anon() returns void
language sql as $$
  select set_config('role', 'anon', true);
  select set_config('request.jwt.claims', '{"role":"anon"}', true);
$$;

create function tests.logout() returns void
language sql as $$
  select set_config('role', 'postgres', true);
  select set_config('request.jwt.claims', '', true);
$$;

-- Guarda tokens gerados durante o teste
create table tests.tokens (name text primary key, token text);
grant all on tests.tokens to authenticated;

select tests.create_user('00000000-0000-0000-0000-00000000000a', 'maonaroda.gg@gmail.com', 'Dono');
select tests.create_user('00000000-0000-0000-0000-00000000000b', 'b@teste.com', 'Bia');
select tests.create_user('00000000-0000-0000-0000-0000000000ff', 'x@teste.com', 'Estranho');

select is((select count(*)::int from public.profiles), 3, 'trigger cria perfil no primeiro login');

-- Visitante sem login não chama nada
select tests.login_anon();
select throws_ok('select public.get_access_state()', '42501', null, 'anon não executa get_access_state');
select throws_ok('select * from public.profiles', '42501', null, 'anon não lê profiles');

-- Estranho antes de existir equipe
select tests.login_as('00000000-0000-0000-0000-0000000000ff');
select is(public.get_access_state(), 'no_access', 'estranho: sem acesso');
select throws_ok($$select public.create_team('Equipe do estranho')$$, 'P0001', 'not_allowed', 'estranho não cria equipe');

-- Dono cria a equipe
select tests.login_as('00000000-0000-0000-0000-00000000000a');
select is(public.get_access_state(), 'can_create_team', 'dono pode criar equipe');
select isnt(public.create_team('MãoNaRoda'), null, 'dono cria equipe');
select is(public.get_access_state(), 'member', 'dono vira membro');
select throws_ok($$select public.create_team('Outra')$$, 'P0001', 'team_exists', 'não cria segunda equipe');

-- Estranho logado não vê dado nenhum (RF-05)
select tests.login_as('00000000-0000-0000-0000-0000000000ff');
select is(public.get_access_state(), 'no_access', 'estranho continua sem acesso');
select is((select count(*)::int from public.team), 0, 'estranho não vê a equipe');
select is((select count(*)::int from public.team_members), 0, 'estranho não vê membros');
select is((select count(*)::int from public.invites), 0, 'estranho não vê convites');
select is((select count(*)::int from public.profiles), 1, 'estranho só vê o próprio perfil');
select throws_ok('select public.create_invite()', 'P0001', 'not_member', 'estranho não gera convite');
select throws_ok(
  $$insert into public.team_members (user_id) values ('00000000-0000-0000-0000-0000000000ff')$$,
  '42501', null, 'estranho não se insere direto em team_members'
);

-- Convite 1: gerado pelo dono e usado por B
select tests.login_as('00000000-0000-0000-0000-00000000000a');
insert into tests.tokens values ('t1', public.create_invite());

select tests.login_as('00000000-0000-0000-0000-0000000000ff');
select is(public.accept_invite('token-que-nao-existe'), 'invalid', 'token inválido');

select tests.login_as('00000000-0000-0000-0000-00000000000b');
select is(public.accept_invite((select token from tests.tokens where name = 't1')), 'ok', 'B entra com convite válido');
select is(public.get_access_state(), 'member', 'B virou membro');
select is((select count(*)::int from public.profiles), 2, 'B vê o perfil dos 2 membros (e não o do estranho)');
select is(public.accept_invite((select token from tests.tokens where name = 't1')), 'already_member', 'membro não reusa convite');

select tests.login_as('00000000-0000-0000-0000-0000000000ff');
select is(public.accept_invite((select token from tests.tokens where name = 't1')), 'used', 'convite é de uso único');

-- Convite 2: expirado
select tests.login_as('00000000-0000-0000-0000-00000000000a');
insert into tests.tokens values ('t2', public.create_invite());
select tests.logout();
update public.invites set expires_at = now() - interval '1 second'
  where used_at is null and revoked_at is null;

select tests.login_as('00000000-0000-0000-0000-0000000000ff');
select is(public.accept_invite((select token from tests.tokens where name = 't2')), 'expired', 'convite expirado após 7 dias');

-- Convite 3: revogado por B (qualquer membro revoga)
select tests.login_as('00000000-0000-0000-0000-00000000000a');
insert into tests.tokens values ('t3', public.create_invite());

select tests.login_as('00000000-0000-0000-0000-00000000000b');
select lives_ok(
  $$select public.revoke_invite((select id from public.invites where used_at is null and revoked_at is null and expires_at > now()))$$,
  'B revoga convite pendente'
);
select throws_ok('select token_hash from public.invites', '42501', null, 'membro não lê token_hash');

select tests.login_as('00000000-0000-0000-0000-0000000000ff');
select is(public.accept_invite((select token from tests.tokens where name = 't3')), 'revoked', 'convite revogado não funciona');

-- Remoção de membros: só o dono
select tests.login_as('00000000-0000-0000-0000-00000000000b');
delete from public.team_members where user_id = '00000000-0000-0000-0000-00000000000a';
select is((select count(*)::int from public.team_members), 2, 'B não remove o dono');

select tests.login_as('00000000-0000-0000-0000-00000000000a');
delete from public.team_members where user_id = '00000000-0000-0000-0000-00000000000a';
select is((select count(*)::int from public.team_members), 2, 'dono não remove a si mesmo');
delete from public.team_members where user_id = '00000000-0000-0000-0000-00000000000b';
select is((select count(*)::int from public.team_members), 1, 'dono remove B');

select tests.login_as('00000000-0000-0000-0000-00000000000b');
select is(public.get_access_state(), 'no_access', 'B removido perde acesso');
select is((select count(*)::int from public.team), 0, 'B removido não vê a equipe');

select * from finish();
rollback;
