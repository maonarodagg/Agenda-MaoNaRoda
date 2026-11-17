-- Salva evento + participantes + links numa transação só.
-- security invoker: roda como quem chamou, então TODAS as policies de RLS valem.

-- Os opcionais ficam no fim com default null (a API chama por nome).
create function public.save_event(
  p_title text,
  p_start_at timestamptz,
  p_end_at timestamptz,
  p_all_day boolean,
  p_visibility public.event_visibility,
  p_participant_ids uuid[],          -- sem o criador; ignorado se pessoal
  p_links jsonb,                     -- [{ "url": "...", "title": "..." }]
  p_id uuid default null,            -- null = criar
  p_description text default null,
  p_location text default null,
  p_category_id uuid default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
  v_creator uuid;
  v_participants uuid[];
begin
  if p_id is null then
    insert into public.events (title, description, start_at, end_at, all_day, location, category_id, visibility)
    values (p_title, p_description, p_start_at, p_end_at, p_all_day, p_location, p_category_id, p_visibility)
    returning id, created_by into v_id, v_creator;
  else
    update public.events
    set title = p_title,
        description = p_description,
        start_at = p_start_at,
        end_at = p_end_at,
        all_day = p_all_day,
        location = p_location,
        category_id = p_category_id,
        visibility = p_visibility
    where id = p_id
    returning id, created_by into v_id, v_creator;

    -- RLS escondeu ou bloqueou a linha: sem permissão (ou não existe).
    if v_id is null then
      raise exception 'event_not_found_or_forbidden';
    end if;
  end if;

  -- Links primeiro (quem edita pode se tirar dos participantes logo abaixo).
  delete from public.event_links where event_id = v_id;
  insert into public.event_links (event_id, url, title, position)
  select v_id, trim(l ->> 'url'), nullif(trim(l ->> 'title'), ''), (ord - 1)::int
  from jsonb_array_elements(coalesce(p_links, '[]'::jsonb)) with ordinality as t(l, ord)
  where coalesce(trim(l ->> 'url'), '') <> '';

  -- Participantes: pessoal não tem; criador não entra na lista.
  if p_visibility = 'personal' then
    v_participants := '{}';
  else
    select coalesce(array_agg(distinct u), '{}') into v_participants
    from unnest(coalesce(p_participant_ids, '{}')) as u
    where u is distinct from v_creator;
  end if;

  delete from public.event_participants
  where event_id = v_id and user_id <> all (v_participants);

  insert into public.event_participants (event_id, user_id)
  select v_id, u from unnest(v_participants) as u
  on conflict (event_id, user_id) do nothing;

  return v_id;
end;
$$;

revoke all on function public.save_event(
  text, timestamptz, timestamptz, boolean, public.event_visibility, uuid[], jsonb, uuid, text, text, uuid
) from public, anon;

grant execute on function public.save_event(
  text, timestamptz, timestamptz, boolean, public.event_visibility, uuid[], jsonb, uuid, text, text, uuid
) to authenticated;
