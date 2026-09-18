-- Atividades resolvidas por usuário logado.
-- O editor funciona sem conta: o histórico local (localStorage) fica no navegador.
-- Só quem tem conta sincroniza aqui e entra no ranking geral.

create table if not exists public.atividades (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  exercicio_id text not null,
  concluida boolean not null default true,
  pontuacao smallint not null default 0,
  resolvida_em timestamptz not null default now()
);

-- Upsert por usuário + exercício (o app usa onConflict para não duplicar)
create unique index if not exists atividades_user_exercicio_uidx
  on public.atividades (user_id, exercicio_id);

-- Consultas do usuário (histórico) e do ranking
create index if not exists atividades_user_id_idx on public.atividades (user_id);
create index if not exists atividades_exercicio_id_idx on public.atividades (exercicio_id);
create index if not exists atividades_resolvida_em_idx on public.atividades (resolvida_em desc);

alter table public.atividades enable row level security;

-- Nada deve passar por aqui sem RLS. NÃO use FORCE aqui: a função do ranking
-- (security definer) precisa ler o agregado de todos os usuários.

create policy atividades_select_own on public.atividades
  for select to authenticated using (auth.uid() = user_id);

create policy atividades_insert_own on public.atividades
  for insert to authenticated with check (auth.uid() = user_id);

create policy atividades_update_own on public.atividades
  for update to authenticated using (auth.uid() = user_id);

-- Ranking geral: pontuação somada, nome vindo dos metadados do usuário.
-- security definer + search_path fixo: devolve só contagens e nome, nunca e-mail alheio.
create or replace function public.ranking_geral()
returns table (
  nome text,
  resolvidos bigint,
  pontos bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce((au.raw_user_meta_data ->> 'nickname'), split_part(au.email, '@', 1)) as nome,
    count(distinct a.exercicio_id) as resolvidos,
    sum(a.pontuacao) as pontos
  from public.atividades a
  join auth.users au on au.id = a.user_id
  where a.concluida
  group by au.id
  order by pontos desc, resolvidos desc, nome asc
  limit 50
$$;

grant execute on function public.ranking_geral() to anon, authenticated;