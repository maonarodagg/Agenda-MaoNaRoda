-- Cria o perfil de contas que já existiam antes do gatilho on_auth_user_created.
-- Pode rodar mais de uma vez: só insere quem ainda não tem perfil.
insert into public.profiles (id, email, full_name, avatar_url)
select
  u.id,
  coalesce(u.email, ''),
  nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
  null
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);
