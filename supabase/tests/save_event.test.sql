-- Testes da RPC save_event (roda como quem chama: a RLS tem que continuar valendo).
-- A, B e C são membros; D não é.
begin;
create extension if not exists pgtap with schema extensions;

select plan(14);

create schema tests;
grant usage on schema tests to anon, authenticated;

create function tests.create_user(p_id uuid, p_email text) returns void
language sql as $$
  insert into auth.users (id, email, raw_user_meta_data, aud, role, email_confirmed_at)
  values (p_id, p_email, '{}'::jsonb, 'authenticated', 'authenticated', now());
$$;

create function tests.login_as(p_id uuid) returns void
language sql as $$
  select set_config('role', 'authenticated', true);
  select set_config('request.jwt.claims', json_build_object('sub', p_id, 'role', 'authenticated')::text, true);
$$;

create table tests.ids (name text primary key, id uuid);
grant all on tests.ids to authenticated;

delete from public.events;
delete from public.invites;
delete from public.team_members;
delete from public.team;
delete from auth.users;

select tests.create_user('00000000-0000-0000-0000-00000000000a', 'a@teste.com');
select tests.create_user('00000000-0000-0000-0000-00000000000b', 'b@teste.com');
select tests.create_user('00000000-0000-0000-0000-00000000000c', 'c@teste.com');
select tests.create_user('00000000-0000-0000-0000-00000000000d', 'd@teste.com');
insert into public.team (name, owner_id) values ('Equipe', '00000000-0000-0000-0000-00000000000a');
insert into public.team_members (user_id) values
  ('00000000-0000-0000-0000-00000000000a'),
  ('00000000-0000-0000-0000-00000000000b'),
  ('00000000-0000-0000-0000-00000000000c');

-- A cria evento de grupo com B (e se inclui por engano: deve ser ignorado)
select tests.login_as('00000000-0000-0000-0000-00000000000a');
insert into tests.ids values ('g', public.save_event(p_id => null, p_title => 'Grupo', p_description => null, p_start_at => now(), p_end_at => now() + interval '1 hour', p_all_day => false, p_location => null, p_category_id => null, p_visibility => 'group', p_participant_ids => array['00000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-00000000000a']::uuid[], p_links => '[{"url": "https://meet.google.com/x", "title": "Meet"}, {"url": "  ", "title": "vazio"}]'::jsonb));

select is(
  (select array_agg(user_id) from public.event_participants where event_id = (select id from tests.ids where name = 'g')),
  array['00000000-0000-0000-0000-00000000000b']::uuid[],
  'participantes salvos, sem o criador'
);
select is(
  (select count(*)::int from public.event_links where event_id = (select id from tests.ids where name = 'g')),
  1, 'link vazio é ignorado'
);

-- Pessoal ignora participantes
insert into tests.ids values ('p', public.save_event(p_id => null, p_title => 'Pessoal', p_description => null, p_start_at => now(), p_end_at => now(), p_all_day => false, p_location => null, p_category_id => null, p_visibility => 'personal', p_participant_ids => array['00000000-0000-0000-0000-00000000000b']::uuid[], p_links => '[]'::jsonb));
select is(
  (select count(*)::int from public.event_participants where event_id = (select id from tests.ids where name = 'p')),
  0, 'evento pessoal não guarda participantes'
);

-- Não-membro como participante: RLS barra e nada fica salvo
select throws_ok(
  $$select public.save_event(p_id => null, p_title => 'Com intruso', p_description => null, p_start_at => now(), p_end_at => now(), p_all_day => false, p_location => null, p_category_id => null, p_visibility => 'group', p_participant_ids => array['00000000-0000-0000-0000-00000000000d']::uuid[], p_links => '[]'::jsonb)$$,
  '42501', null, 'não aceita não-membro como participante'
);
select is((select count(*)::int from public.events where title = 'Com intruso'), 0, 'falha desfaz o evento inteiro');

select throws_ok(
  $$select public.save_event(p_id => null, p_title => 'Link ruim', p_description => null, p_start_at => now(), p_end_at => now(), p_all_day => false, p_location => null, p_category_id => null, p_visibility => 'team', p_participant_ids => '{}'::uuid[], p_links => '[{"url": "ftp://x"}]'::jsonb)$$,
  '23514', null, 'link sem http(s) é recusado'
);

-- B (participante) edita: troca o título e o link
select tests.login_as('00000000-0000-0000-0000-00000000000b');
select lives_ok(
  $$select public.save_event(p_id => (select id from tests.ids where name = 'g'), p_title => 'Grupo editado', p_description => 'desc', p_start_at => now(), p_end_at => now() + interval '2 hours', p_all_day => false, p_location => 'Sala 1', p_category_id => null, p_visibility => 'group', p_participant_ids => array['00000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-00000000000c']::uuid[], p_links => '[{"url": "https://drive.google.com/y"}]'::jsonb)$$,
  'participante edita pelo save_event'
);
select is(
  (select title from public.events where id = (select id from tests.ids where name = 'g')),
  'Grupo editado', 'título atualizado'
);
select is(
  (select created_by from public.events where id = (select id from tests.ids where name = 'g')),
  '00000000-0000-0000-0000-00000000000a'::uuid, 'criador continua sendo A'
);
select is(
  (select array_agg(url) from public.event_links where event_id = (select id from tests.ids where name = 'g')),
  array['https://drive.google.com/y'], 'links substituídos'
);
select is(
  (select count(*)::int from public.event_participants where event_id = (select id from tests.ids where name = 'g')),
  2, 'B adicionou C como participante'
);

-- C vira participante e passa a ver; mas não edita o pessoal de A
select tests.login_as('00000000-0000-0000-0000-00000000000c');
select is(
  (select count(*)::int from public.events where id = (select id from tests.ids where name = 'g')),
  1, 'C agora vê o grupo'
);
select throws_ok(
  $$select public.save_event(p_id => (select id from tests.ids where name = 'p'), p_title => 'Invasão', p_description => null, p_start_at => now(), p_end_at => now(), p_all_day => false, p_location => null, p_category_id => null, p_visibility => 'team', p_participant_ids => '{}'::uuid[], p_links => '[]'::jsonb)$$,
  'P0001', 'event_not_found_or_forbidden', 'C não edita o pessoal de A'
);

-- D (não-membro) não cria nada
select tests.login_as('00000000-0000-0000-0000-00000000000d');
select throws_ok(
  $$select public.save_event(p_id => null, p_title => 'Intruso', p_description => null, p_start_at => now(), p_end_at => now(), p_all_day => false, p_location => null, p_category_id => null, p_visibility => 'team', p_participant_ids => '{}'::uuid[], p_links => '[]'::jsonb)$$,
  '42501', null, 'não-membro não cria evento'
);

select * from finish();
rollback;
