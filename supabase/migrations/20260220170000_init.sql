create type tier_id as enum (
  'foundational_dogma',
  'official_doctrine',
  'theological_deduction',
  'personal_speculation'
);

create type relationship_type as enum (
  'supports',
  'relies_upon',
  'contradicts',
  'qualifies'
);

create type validation_status as enum (
  'consistent',
  'warning',
  'contradiction'
);

create table if not exists public.systems (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  presuppositions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.nodes (
  id uuid primary key default gen_random_uuid(),
  system_id uuid not null references public.systems(id) on delete cascade,
  tier_id tier_id not null,
  title text not null,
  description text not null default '',
  notes text not null default '',
  is_locked boolean not null default false,
  x_position double precision not null default 0,
  y_position double precision not null default 0,
  validation_status validation_status,
  validation_critique text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.edges (
  id uuid primary key default gen_random_uuid(),
  system_id uuid not null references public.systems(id) on delete cascade,
  source_node_id uuid not null references public.nodes(id) on delete cascade,
  target_node_id uuid not null references public.nodes(id) on delete cascade,
  relationship_type relationship_type not null,
  created_at timestamptz not null default now(),
  check (source_node_id <> target_node_id)
);

create unique index if not exists edges_unique_idx
  on public.edges(system_id, source_node_id, target_node_id, relationship_type);

create table if not exists public.validator_daily_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null,
  count integer not null default 0,
  primary key (user_id, usage_date)
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_systems_updated_at
before update on public.systems
for each row execute function public.touch_updated_at();

create trigger touch_nodes_updated_at
before update on public.nodes
for each row execute function public.touch_updated_at();

create or replace function public.prevent_locked_node_delete_or_tier_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' and old.is_locked then
    raise exception 'Locked nodes cannot be deleted';
  end if;

  if tg_op = 'UPDATE' and old.is_locked and new.tier_id <> old.tier_id then
    raise exception 'Locked nodes cannot change tier';
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger locked_node_guard_update
before update on public.nodes
for each row execute function public.prevent_locked_node_delete_or_tier_change();

create trigger locked_node_guard_delete
before delete on public.nodes
for each row execute function public.prevent_locked_node_delete_or_tier_change();

create or replace function public.edge_nodes_match_system()
returns trigger
language plpgsql
as $$
declare
  source_system uuid;
  target_system uuid;
begin
  select system_id into source_system from public.nodes where id = new.source_node_id;
  select system_id into target_system from public.nodes where id = new.target_node_id;

  if source_system is null or target_system is null then
    raise exception 'Source or target node not found';
  end if;

  if source_system <> new.system_id or target_system <> new.system_id then
    raise exception 'Edge nodes must belong to the same system';
  end if;

  return new;
end;
$$;

create trigger edge_system_guard
before insert or update on public.edges
for each row execute function public.edge_nodes_match_system();

alter table public.systems enable row level security;
alter table public.nodes enable row level security;
alter table public.edges enable row level security;
alter table public.validator_daily_usage enable row level security;

create policy systems_owner_all on public.systems
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy nodes_owner_all on public.nodes
for all using (
  exists (
    select 1 from public.systems s
    where s.id = system_id and s.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.systems s
    where s.id = system_id and s.user_id = auth.uid()
  )
);

create policy edges_owner_all on public.edges
for all using (
  exists (
    select 1 from public.systems s
    where s.id = system_id and s.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.systems s
    where s.id = system_id and s.user_id = auth.uid()
  )
);

create policy validator_usage_owner_all on public.validator_daily_usage
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);
