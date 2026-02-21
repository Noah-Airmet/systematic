alter table public.systems
  add column if not exists tiers jsonb not null default '[
    {"id":"layer_2","name":"Tier 3","is_foundational":false},
    {"id":"layer_1","name":"Tier 2","is_foundational":false},
    {"id":"foundational_core","name":"Foundational Core","is_foundational":true}
  ]'::jsonb;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'nodes'
      and column_name = 'tier_id'
      and udt_name = 'tier_id'
  ) then
    alter table public.nodes
      alter column tier_id type text using tier_id::text;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'locked_node_guard_update'
      and tgrelid = 'public.nodes'::regclass
  ) then
    alter table public.nodes disable trigger locked_node_guard_update;
  end if;
end $$;

update public.nodes
set tier_id = case tier_id
  when 'foundational_dogma' then 'foundational_core'
  when 'official_doctrine' then 'layer_1'
  when 'theological_deduction' then 'layer_2'
  when 'personal_speculation' then 'layer_2'
  else tier_id
end;

update public.nodes
set tier_id = 'foundational_core'
where is_locked = true;

do $$
begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'locked_node_guard_update'
      and tgrelid = 'public.nodes'::regclass
  ) then
    alter table public.nodes enable trigger locked_node_guard_update;
  end if;
end $$;
