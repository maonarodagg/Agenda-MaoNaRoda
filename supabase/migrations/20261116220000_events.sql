-- Fase 1: categorias, eventos (pessoal/grupo/equipe), participantes e links.
-- Visibilidade decidida aqui, por RLS (RNF-01, RN-01 a RN-03).

create type public.event_visibility as enum ('personal', 'group', 'team');

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------

-- Categorias com cor, editáveis por qualquer membro (RF-13).
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 40),
  color text not null check (color ~ '^#[0-9a-fA-F]{6}$'),
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create unique index categories_name_key on public.categories (lower(trim(name)));

-- Padrões (created_by vazio = sistema)
insert into public.categories (name, color, created_by) values
  ('Reunião', '#0A66E0', null),
  ('Estudo', '#18A558', null),
  ('Entrega', '#E5484D', null),
  ('Pessoal', '#8E59D9', null);

-- Horários em UTC. Dia inteiro: 00:00 de São Paulo, fim exclusivo.
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 1 and 200),
  description text check (char_length(description) <= 5000),
  start_at timestamptz not null,
  end_at timestamptz not null,
  all_day boolean not null default false,
  location text check (char_length(location) <= 500),
  category_id uuid references public.categories (id) on delete set null,
  visibility public.event_visibility not null default 'team',
  created_by uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_end_after_start check (end_at >= start_at)
);

create index events_start_at_idx on public.events (start_at);
create index events_end_at_idx on public.events (end_at);

-- left_at fica pronto pra Fase 2 (sair do evento); por enquanto sempre null.
create table public.event_participants (
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  added_at timestamptz not null default now(),
  left_at timestamptz,
  primary key (event_id, user_id)
);

create index event_participants_user_idx on public.event_participants (user_id);

-- Links (Meet, Drive...). Só links, sem upload (RF-14).
create table public.event_links (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  url text not null check (url ~* '^https?://' and char_length(url) <= 2000),
  title text check (char_length(title) <= 120),
  position integer not null default 0
);

create index event_links_event_idx on public.event_links (event_id);

-- ---------------------------------------------------------------------------
-- Funções auxiliares
-- ---------------------------------------------------------------------------

-- Usuário logado é participante ativo do evento.
create function private.is_participant(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.event_participants
    where event_id = p_event_id and user_id = auth.uid() and left_at is null
  );
$$;

-- Pode ver: membro e (equipe, ou criador, ou participante ativo).
create function private.can_view_event(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_member() and exists (
    select 1 from public.events e
    where e.id = p_event_id
      and (e.visibility = 'team' or e.created_by = auth.uid() or private.is_participant(e.id))
  );
$$;

-- Pode editar/excluir: membro e (criador ou participante ativo) (RN-04).
create function private.can_edit_event(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_member() and exists (
    select 1 from public.events e
    where e.id = p_event_id
      and (e.created_by = auth.uid() or private.is_participant(e.id))
  );
$$;

create function private.event_visibility_of(p_event_id uuid)
returns public.event_visibility
language sql
stable
security definer
set search_path = ''
as $$
  select visibility from public.events where id = p_event_id;
$$;

revoke all on function
  private.is_participant(uuid),
  private.can_view_event(uuid),
  private.can_edit_event(uuid),
  private.event_visibility_of(uuid)
  from public, anon;

grant execute on function
  private.is_participant(uuid),
  private.can_view_event(uuid),
  private.can_edit_event(uuid),
  private.event_visibility_of(uuid)
  to authenticated;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

-- Criador nunca muda; updated_at sempre atualizado.
create function private.events_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.created_by := old.created_by;
  new.created_at := old.created_at;
  new.updated_at := now();
  return new;
end;
$$;

create trigger events_before_update
  before update on public.events
  for each row execute function private.events_before_update();

-- Evento que vira pessoal perde os participantes (pessoal = só o criador).
create function private.events_after_personal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.visibility = 'personal' and old.visibility <> 'personal' then
    delete from public.event_participants where event_id = new.id;
  end if;
  return null;
end;
$$;

create trigger events_after_personal
  after update of visibility on public.events
  for each row execute function private.events_after_personal();

-- ---------------------------------------------------------------------------
-- RLS e permissões
-- ---------------------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.events enable row level security;
alter table public.event_participants enable row level security;
alter table public.event_links enable row level security;

revoke all on public.categories, public.events, public.event_participants, public.event_links
  from anon, authenticated;

grant select, insert, update, delete
  on public.categories, public.events, public.event_participants, public.event_links
  to authenticated;

-- Categorias: qualquer membro faz tudo.
create policy "categories: membros veem" on public.categories
  for select to authenticated using (private.is_member());
create policy "categories: membros criam" on public.categories
  for insert to authenticated with check (private.is_member());
create policy "categories: membros editam" on public.categories
  for update to authenticated using (private.is_member()) with check (private.is_member());
create policy "categories: membros excluem" on public.categories
  for delete to authenticated using (private.is_member());

-- Eventos. As condições usam as colunas da própria linha (funciona no insert ... returning).
create policy "events: ver conforme visibilidade" on public.events
  for select to authenticated
  using (
    private.is_member()
    and (visibility = 'team' or created_by = auth.uid() or private.is_participant(id))
  );

create policy "events: membro cria como ele mesmo" on public.events
  for insert to authenticated
  with check (private.is_member() and created_by = auth.uid());

create policy "events: criador ou participante edita" on public.events
  for update to authenticated
  using (private.is_member() and (created_by = auth.uid() or private.is_participant(id)))
  with check (private.is_member());

create policy "events: criador ou participante exclui" on public.events
  for delete to authenticated
  using (private.is_member() and (created_by = auth.uid() or private.is_participant(id)));

-- Participantes: quem vê o evento vê a lista; quem edita o evento mexe nela.
create policy "event_participants: ver" on public.event_participants
  for select to authenticated using (private.can_view_event(event_id));

create policy "event_participants: adicionar" on public.event_participants
  for insert to authenticated
  with check (
    private.can_edit_event(event_id)
    and private.event_visibility_of(event_id) <> 'personal'
    and private.is_team_member(user_id)
    and left_at is null
  );

create policy "event_participants: remover" on public.event_participants
  for delete to authenticated using (private.can_edit_event(event_id));

-- Links: mesma regra do evento.
create policy "event_links: ver" on public.event_links
  for select to authenticated using (private.can_view_event(event_id));
create policy "event_links: criar" on public.event_links
  for insert to authenticated with check (private.can_edit_event(event_id));
create policy "event_links: editar" on public.event_links
  for update to authenticated
  using (private.can_edit_event(event_id)) with check (private.can_edit_event(event_id));
create policy "event_links: excluir" on public.event_links
  for delete to authenticated using (private.can_edit_event(event_id));
