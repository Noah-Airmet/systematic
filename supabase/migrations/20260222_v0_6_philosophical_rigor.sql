-- =============================================================================
-- Systematic v0.6 — "Philosophical Rigor" Migration
-- =============================================================================

-- 1. Argument qualifier enum (Toulmin model)
create type argument_qualifier as enum (
  'necessarily',
  'probably',
  'presumably',
  'possibly',
  'in_most_cases'
);

-- 2. Inference type enum (edge classification)
create type inference_type as enum (
  'deductive',
  'inductive',
  'abductive',
  'analogical',
  'exegetical'
);

-- 3. Toulmin argument fields on nodes
alter table nodes add column grounds text not null default '';
alter table nodes add column warrant text not null default '';
alter table nodes add column backing text not null default '';
alter table nodes add column qualifier argument_qualifier;
alter table nodes add column rebuttal text not null default '';

-- 4. Epistemic sources on nodes (text array, like existing tags)
alter table nodes add column epistemic_sources text[] not null default '{}';

-- 5. Inference type on edges (nullable — backward compatible)
alter table edges add column inference_type inference_type;

-- 6. Definition registry table
create table definitions (
  id uuid primary key default gen_random_uuid(),
  system_id uuid not null references systems(id) on delete cascade,
  term text not null,
  definition text not null,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reuse the existing touch_updated_at trigger function
create trigger touch_definition_updated_at
  before update on definitions
  for each row execute function touch_updated_at();

alter table definitions enable row level security;

create policy "Owner can manage definitions"
  on definitions for all
  using (
    system_id in (select id from systems where user_id = auth.uid())
  );

-- 7. Node-definition join table (many-to-many)
create table node_definitions (
  node_id uuid not null references nodes(id) on delete cascade,
  definition_id uuid not null references definitions(id) on delete cascade,
  primary key (node_id, definition_id)
);

alter table node_definitions enable row level security;

create policy "Owner can manage node_definitions"
  on node_definitions for all
  using (
    node_id in (
      select n.id from nodes n
      join systems s on n.system_id = s.id
      where s.user_id = auth.uid()
    )
  );
