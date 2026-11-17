-- Testes de RLS dos eventos (RN-01 a RN-04) e categorias.
-- A, B e C são membros; D tem conta confirmada mas não é membro.
-- A cria: P (pessoal), G (grupo com B), T (equipe) e G2 (grupo com B).
begin;
create extension if not exists pgtap with schema extensions;

select plan(36);

create schema tests;
grant usage on schema tests to anon, authenticated;

create function tests.create_user(p_id uuid, p_email text, p_name text) returns void
language sql as $$
  insert into auth.users (id, email, raw_user_meta_data, aud, role, email_confirmed_at)
  values (p_id, p_email, jsonb_build_object('full_name', p_name), 'authenticated', 'authenticated', now());
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

-- Começa do zero (tudo volta no rollback do fim)
delete from public.events;
delete from public.invites;
delete from public.team_members;
delete from public.team;
delete from auth.users;
-- Categorias padrão, como a migration cria (o banco local pode ter sido mexido pela tela)
delete from public.categories;
insert into public.categories (name, color, created_by) values
  ('Reunião', '#0A66E0', null),
  ('Estudo', '#18A558', null),
  ('Entrega', '#E5484D', null),
  ('Pessoal', '#8E59D9', null);

select tests.create_user('00000000-0000-0000-0000-00000000000a', 'a@teste.com', 'Ana');
select tests.create_user('00000000-0000-0000-0000-00000000000b', 'b@teste.com', 'Bia');
select tests.create_user('00000000-0000-0000-0000-00000000000c', 'c@teste.com', 'Caio');
select tests.create_user('00000000-0000-0000-0000-00000000000d', 'd@teste.com', 'Duda');

-- Equipe com A (dono), B e C. D fica de fora.
insert into public.team (name, owner_id) values ('Equipe teste', '00000000-0000-0000-0000-00000000000a');
insert into public.team_members (user_id) values
  ('00000000-0000-0000-0000-00000000000a'),
  ('00000000-0000-0000-0000-00000000000b'),
  ('00000000-0000-0000-0000-00000000000c');

-- A cria os eventos pela API (como ele mesmo)
select tests.login_as('00000000-0000-0000-0000-00000000000a');

insert into public.events (id, title, start_at, end_at, visibility) values
  ('10000000-0000-0000-0000-000000000001', 'Pessoal da Ana', now(), now() + interval '1 hour', 'personal'),
  ('10000000-0000-0000-0000-000000000002', 'Grupo Ana+Bia', now(), now() + interval '1 hour', 'group'),
  ('10000000-0000-0000-0000-000000000003', 'Reunião da equipe', now(), now() + interval '1 hour', 'team'),
  ('10000000-0000-0000-0000-000000000004', 'Outro grupo Ana+Bia', now(), now() + interval '1 hour', 'group');

insert into public.event_participants (event_id, user_id) values
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-00000000000b'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-00000000000b');

insert into public.event_links (event_id, url, title) values
  ('10000000-0000-0000-0000-000000000002', 'https://meet.google.com/abc', 'Meet');

select is((select count(*)::int from public.events), 4, 'A (criador) vê os 4 eventos');
select is(
  (select created_by from public.events where id = '10000000-0000-0000-0000-000000000003'),
  '00000000-0000-0000-0000-00000000000a'::uuid,
  'created_by preenchido com quem criou'
);

select throws_ok(
  $$insert into public.event_participants (event_id, user_id)
    values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b')$$,
  '42501', null, 'evento pessoal não aceita participantes'
);
select throws_ok(
  $$insert into public.event_participants (event_id, user_id)
    values ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-00000000000d')$$,
  '42501', null, 'não-membro não pode ser participante'
);
select throws_ok(
  $$insert into public.event_links (event_id, url) values ('10000000-0000-0000-0000-000000000002', 'javascript:alert(1)')$$,
  '23514', null, 'link precisa ser http(s)'
);

-- B: participante do grupo
select tests.login_as('00000000-0000-0000-0000-00000000000b');
select results_eq(
  'select title from public.events order by title',
  $$values ('Grupo Ana+Bia'), ('Outro grupo Ana+Bia'), ('Reunião da equipe')$$,
  'B vê os grupos em que participa e o de equipe, NÃO o pessoal da Ana'
);
select is((select count(*)::int from public.event_links), 1, 'B vê o link do grupo');
select is((select count(*)::int from public.event_participants), 2, 'B vê os participantes dos seus grupos');

update public.events set title = 'Grupo editado pela Bia' where id = '10000000-0000-0000-0000-000000000002';
select is(
  (select title from public.events where id = '10000000-0000-0000-0000-000000000002'),
  'Grupo editado pela Bia', 'participante edita o evento (RN-04)'
);

update public.events set created_by = '00000000-0000-0000-0000-00000000000b'
  where id = '10000000-0000-0000-0000-000000000002';
select is(
  (select created_by from public.events where id = '10000000-0000-0000-0000-000000000002'),
  '00000000-0000-0000-0000-00000000000a'::uuid, 'criador não pode ser trocado'
);

update public.events set title = 'Bia mexeu no pessoal' where id = '10000000-0000-0000-0000-000000000001';
delete from public.events where id = '10000000-0000-0000-0000-000000000003';

select lives_ok(
  $$delete from public.events where id = '10000000-0000-0000-0000-000000000004'$$,
  'participante exclui evento de grupo (RN-04)'
);

-- C: membro que não participa de nada
select tests.login_as('00000000-0000-0000-0000-00000000000c');
select results_eq(
  'select title from public.events order by title',
  $$values ('Reunião da equipe')$$,
  'C vê só o evento de equipe (B não conseguiu apagar o de equipe)'
);
select is((select count(*)::int from public.event_links), 0, 'C não vê links do grupo');
select is((select count(*)::int from public.event_participants), 0, 'C não vê participantes do grupo');

update public.events set title = 'C mexeu no grupo' where id = '10000000-0000-0000-0000-000000000002';
update public.events set title = 'C mexeu na equipe' where id = '10000000-0000-0000-0000-000000000003';
delete from public.events where id = '10000000-0000-0000-0000-000000000002';

select throws_ok(
  $$insert into public.event_participants (event_id, user_id)
    values ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-00000000000c')$$,
  '42501', null, 'C não se coloca como participante do grupo'
);
select throws_ok(
  $$insert into public.event_links (event_id, url) values ('10000000-0000-0000-0000-000000000002', 'https://x.com')$$,
  '42501', null, 'C não adiciona link no grupo'
);
select throws_ok(
  $$insert into public.events (title, start_at, end_at, created_by)
    values ('Fingindo ser a Ana', now(), now(), '00000000-0000-0000-0000-00000000000a')$$,
  '42501', null, 'C não cria evento em nome de outra pessoa'
);
select throws_ok(
  $$insert into public.events (title, start_at, end_at) values ('Fim antes do início', now(), now() - interval '1 hour')$$,
  '23514', null, 'fim antes do início é recusado'
);
select lives_ok(
  $$insert into public.events (title, start_at, end_at, visibility) values ('Pessoal do Caio', now(), now(), 'personal')$$,
  'C cria evento pessoal'
);

-- Categorias
select is((select count(*)::int from public.categories), 4, 'membro vê as 4 categorias padrão');
select lives_ok(
  $$insert into public.categories (name, color) values ('Design', '#FFAA00')$$, 'membro cria categoria'
);
select throws_ok(
  $$insert into public.categories (name, color) values ('reunião', '#000000')$$,
  '23505', null, 'nome de categoria não repete (sem diferenciar maiúscula)'
);
select throws_ok(
  $$insert into public.categories (name, color) values ('Cor ruim', 'vermelho')$$,
  '23514', null, 'cor precisa ser hex #RRGGBB'
);

-- A confere o que C tentou
select tests.login_as('00000000-0000-0000-0000-00000000000a');
select is(
  (select title from public.events where id = '10000000-0000-0000-0000-000000000002'),
  'Grupo editado pela Bia', 'C não editou nem excluiu o grupo'
);
select is(
  (select title from public.events where id = '10000000-0000-0000-0000-000000000003'),
  'Reunião da equipe', 'C (não participante) não edita evento de equipe'
);
select is(
  (select title from public.events where id = '10000000-0000-0000-0000-000000000001'),
  'Pessoal da Ana', 'B não editou o pessoal da Ana'
);
select is(
  (select count(*)::int from public.events where title = 'Pessoal do Caio'), 0,
  'A não vê o pessoal do Caio'
);

-- Grupo vira pessoal: participantes saem
update public.events set visibility = 'personal' where id = '10000000-0000-0000-0000-000000000002';
select is(
  (select count(*)::int from public.event_participants where event_id = '10000000-0000-0000-0000-000000000002'),
  0, 'grupo que vira pessoal perde os participantes'
);

select tests.login_as('00000000-0000-0000-0000-00000000000b');
select is(
  (select count(*)::int from public.events where id = '10000000-0000-0000-0000-000000000002'),
  0, 'B deixa de ver o evento que virou pessoal'
);

-- D: conta confirmada, mas fora da equipe
select tests.login_as('00000000-0000-0000-0000-00000000000d');
select is((select count(*)::int from public.events), 0, 'não-membro não vê eventos (nem os de equipe)');
select is((select count(*)::int from public.categories), 0, 'não-membro não vê categorias');
select is((select count(*)::int from public.event_links), 0, 'não-membro não vê links');
select throws_ok(
  $$insert into public.events (title, start_at, end_at) values ('Intruso', now(), now())$$,
  '42501', null, 'não-membro não cria evento'
);

-- Visitante sem login
select tests.login_anon();
select throws_ok('select * from public.events', '42501', null, 'anon não lê eventos');

-- Evento de equipe vale pra membros futuros (RF-12)
select tests.logout();
insert into public.team_members (user_id) values ('00000000-0000-0000-0000-00000000000d');
select tests.login_as('00000000-0000-0000-0000-00000000000d');
select results_eq(
  'select title from public.events order by title',
  $$values ('Reunião da equipe')$$,
  'membro novo vê o evento de equipe antigo'
);

-- Membro removido perde tudo
select tests.logout();
delete from public.team_members where user_id = '00000000-0000-0000-0000-00000000000b';
select tests.login_as('00000000-0000-0000-0000-00000000000b');
select is((select count(*)::int from public.events), 0, 'membro removido não vê mais nada');

select * from finish();
rollback;
