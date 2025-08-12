
-- 1) Tables CRM de base

create table if not exists public.crm_companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  name text not null,
  domain text,
  phone text,
  address text,
  city text,
  country text,
  website text,
  tags jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_crm_companies_owner on public.crm_companies(owner_id);
create index if not exists idx_crm_companies_domain on public.crm_companies((lower(domain)));

create table if not exists public.crm_contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  company_id uuid references public.crm_companies(id) on delete set null,
  email text,
  phone text,
  first_name text,
  last_name text,
  lifecycle_stage text not null default 'lead', -- lead, mql, sql, customer, churn
  source text,                                   -- chatbot, webform, import, pos, ecommerce...
  consent_marketing boolean default false,
  consent_updated_at timestamptz,
  gdpr_note text,
  location jsonb not null default '{}'::jsonb,   -- { city, lat, lng }
  tags jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,   -- ex: device, issue, channel
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_crm_contacts_owner on public.crm_contacts(owner_id);
create index if not exists idx_crm_contacts_email on public.crm_contacts((lower(email)));

create table if not exists public.crm_pipelines (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  name text not null,
  is_default boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_crm_pipelines_owner on public.crm_pipelines(owner_id);

create table if not exists public.crm_deal_stages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  pipeline_id uuid not null references public.crm_pipelines(id) on delete cascade,
  name text not null,
  probability numeric, -- 0..1
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_crm_deal_stages_pipeline on public.crm_deal_stages(pipeline_id);
create index if not exists idx_crm_deal_stages_owner on public.crm_deal_stages(owner_id);

create table if not exists public.crm_deals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  contact_id uuid references public.crm_contacts(id) on delete set null,
  company_id uuid references public.crm_companies(id) on delete set null,
  title text not null,
  amount numeric,
  currency text not null default 'EUR',
  pipeline_id uuid references public.crm_pipelines(id) on delete set null,
  stage_id uuid references public.crm_deal_stages(id) on delete set null,
  status text not null default 'open', -- open, won, lost, on_hold
  expected_close_date date,
  source text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_crm_deals_owner on public.crm_deals(owner_id);
create index if not exists idx_crm_deals_stage on public.crm_deals(stage_id);
create index if not exists idx_crm_deals_status on public.crm_deals(status);

create table if not exists public.crm_activities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  type text not null, -- call, email, chat, meeting, note, system
  contact_id uuid references public.crm_contacts(id) on delete set null,
  deal_id uuid references public.crm_deals(id) on delete set null,
  occurred_at timestamptz not null default now(),
  content text,
  data jsonb not null default '{}'::jsonb, -- ex: transcript, channel info
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_crm_activities_owner on public.crm_activities(owner_id);
create index if not exists idx_crm_activities_contact on public.crm_activities(contact_id);
create index if not exists idx_crm_activities_deal on public.crm_activities(deal_id);

create table if not exists public.crm_tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  title text not null,
  description text,
  due_date timestamptz,
  status text not null default 'open',    -- open, in_progress, done, canceled
  priority text not null default 'normal',-- low, normal, high, urgent
  assignee_id uuid,
  related_contact_id uuid references public.crm_contacts(id) on delete set null,
  related_deal_id uuid references public.crm_deals(id) on delete set null,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_crm_tasks_owner on public.crm_tasks(owner_id);
create index if not exists idx_crm_tasks_assignee on public.crm_tasks(assignee_id);
create index if not exists idx_crm_tasks_due on public.crm_tasks(due_date);

create table if not exists public.crm_conversation_links (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  source text not null, -- ai_pre_diagnostic, chatbot, support
  source_id uuid not null,
  contact_id uuid references public.crm_contacts(id) on delete set null,
  deal_id uuid references public.crm_deals(id) on delete set null,
  notes text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, source_id)
);

create index if not exists idx_crm_conversations_owner on public.crm_conversation_links(owner_id);
create index if not exists idx_crm_conversations_contact on public.crm_conversation_links(contact_id);
create index if not exists idx_crm_conversations_deal on public.crm_conversation_links(deal_id);

-- 2) Triggers d'audit (défauts owner/created_by + updated_at)

create or replace function public.set_crm_defaults()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;
  if new.owner_id is null then
    new.owner_id := auth.uid();
  end if;
  if new.created_at is null then
    new.created_at := now();
  end if;
  new.updated_at := now();
  return new;
end;
$$;

-- Attacher les triggers BEFORE INSERT (défauts) et BEFORE UPDATE (updated_at)
do $$
begin
  -- Companies
  if not exists (
    select 1 from pg_trigger where tgname = 'crm_companies_set_defaults'
  ) then
    create trigger crm_companies_set_defaults
      before insert on public.crm_companies
      for each row execute procedure public.set_crm_defaults();
  end if;
  if not exists (
    select 1 from pg_trigger where tgname = 'crm_companies_set_updated_at'
  ) then
    create trigger crm_companies_set_updated_at
      before update on public.crm_companies
      for each row execute procedure public.update_updated_at_column();
  end if;

  -- Contacts
  if not exists (
    select 1 from pg_trigger where tgname = 'crm_contacts_set_defaults'
  ) then
    create trigger crm_contacts_set_defaults
      before insert on public.crm_contacts
      for each row execute procedure public.set_crm_defaults();
  end if;
  if not exists (
    select 1 from pg_trigger where tgname = 'crm_contacts_set_updated_at'
  ) then
    create trigger crm_contacts_set_updated_at
      before update on public.crm_contacts
      for each row execute procedure public.update_updated_at_column();
  end if;

  -- Pipelines
  if not exists (
    select 1 from pg_trigger where tgname = 'crm_pipelines_set_defaults'
  ) then
    create trigger crm_pipelines_set_defaults
      before insert on public.crm_pipelines
      for each row execute procedure public.set_crm_defaults();
  end if;
  if not exists (
    select 1 from pg_trigger where tgname = 'crm_pipelines_set_updated_at'
  ) then
    create trigger crm_pipelines_set_updated_at
      before update on public.crm_pipelines
      for each row execute procedure public.update_updated_at_column();
  end if;

  -- Deal stages
  if not exists (
    select 1 from pg_trigger where tgname = 'crm_deal_stages_set_defaults'
  ) then
    create trigger crm_deal_stages_set_defaults
      before insert on public.crm_deal_stages
      for each row execute procedure public.set_crm_defaults();
  end if;
  if not exists (
    select 1 from pg_trigger where tgname = 'crm_deal_stages_set_updated_at'
  ) then
    create trigger crm_deal_stages_set_updated_at
      before update on public.crm_deal_stages
      for each row execute procedure public.update_updated_at_column();
  end if;

  -- Deals
  if not exists (
    select 1 from pg_trigger where tgname = 'crm_deals_set_defaults'
  ) then
    create trigger crm_deals_set_defaults
      before insert on public.crm_deals
      for each row execute procedure public.set_crm_defaults();
  end if;
  if not exists (
    select 1 from pg_trigger where tgname = 'crm_deals_set_updated_at'
  ) then
    create trigger crm_deals_set_updated_at
      before update on public.crm_deals
      for each row execute procedure public.update_updated_at_column();
  end if;

  -- Activities
  if not exists (
    select 1 from pg_trigger where tgname = 'crm_activities_set_defaults'
  ) then
    create trigger crm_activities_set_defaults
      before insert on public.crm_activities
      for each row execute procedure public.set_crm_defaults();
  end if;
  if not exists (
    select 1 from pg_trigger where tgname = 'crm_activities_set_updated_at'
  ) then
    create trigger crm_activities_set_updated_at
      before update on public.crm_activities
      for each row execute procedure public.update_updated_at_column();
  end if;

  -- Tasks
  if not exists (
    select 1 from pg_trigger where tgname = 'crm_tasks_set_defaults'
  ) then
    create trigger crm_tasks_set_defaults
      before insert on public.crm_tasks
      for each row execute procedure public.set_crm_defaults();
  end if;
  if not exists (
    select 1 from pg_trigger where tgname = 'crm_tasks_set_updated_at'
  ) then
    create trigger crm_tasks_set_updated_at
      before update on public.crm_tasks
      for each row execute procedure public.update_updated_at_column();
  end if;

  -- Conversation links
  if not exists (
    select 1 from pg_trigger where tgname = 'crm_conversation_links_set_defaults'
  ) then
    create trigger crm_conversation_links_set_defaults
      before insert on public.crm_conversation_links
      for each row execute procedure public.set_crm_defaults();
  end if;
  if not exists (
    select 1 from pg_trigger where tgname = 'crm_conversation_links_set_updated_at'
  ) then
    create trigger crm_conversation_links_set_updated_at
      before update on public.crm_conversation_links
      for each row execute procedure public.update_updated_at_column();
  end if;
end$$;

-- 3) RLS: activer et policies (admin full + owner)

alter table public.crm_companies enable row level security;
alter table public.crm_contacts enable row level security;
alter table public.crm_pipelines enable row level security;
alter table public.crm_deal_stages enable row level security;
alter table public.crm_deals enable row level security;
alter table public.crm_activities enable row level security;
alter table public.crm_tasks enable row level security;
alter table public.crm_conversation_links enable row level security;

-- Admin full access
create policy if not exists "Admin all - companies"
  on public.crm_companies for all
  using (public.get_current_user_role() = 'admin')
  with check (public.get_current_user_role() = 'admin');

create policy if not exists "Admin all - contacts"
  on public.crm_contacts for all
  using (public.get_current_user_role() = 'admin')
  with check (public.get_current_user_role() = 'admin');

create policy if not exists "Admin all - pipelines"
  on public.crm_pipelines for all
  using (public.get_current_user_role() = 'admin')
  with check (public.get_current_user_role() = 'admin');

create policy if not exists "Admin all - deal_stages"
  on public.crm_deal_stages for all
  using (public.get_current_user_role() = 'admin')
  with check (public.get_current_user_role() = 'admin');

create policy if not exists "Admin all - deals"
  on public.crm_deals for all
  using (public.get_current_user_role() = 'admin')
  with check (public.get_current_user_role() = 'admin');

create policy if not exists "Admin all - activities"
  on public.crm_activities for all
  using (public.get_current_user_role() = 'admin')
  with check (public.get_current_user_role() = 'admin');

create policy if not exists "Admin all - tasks"
  on public.crm_tasks for all
  using (public.get_current_user_role() = 'admin')
  with check (public.get_current_user_role() = 'admin');

create policy if not exists "Admin all - conv_links"
  on public.crm_conversation_links for all
  using (public.get_current_user_role() = 'admin')
  with check (public.get_current_user_role() = 'admin');

-- Owner-based access (lecture/écriture complète pour le propriétaire)

create policy if not exists "Owner manage - companies"
  on public.crm_companies for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy if not exists "Owner manage - contacts"
  on public.crm_contacts for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy if not exists "Owner manage - pipelines"
  on public.crm_pipelines for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy if not exists "Owner manage - deal_stages"
  on public.crm_deal_stages for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy if not exists "Owner manage - deals"
  on public.crm_deals for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy if not exists "Owner manage - activities"
  on public.crm_activities for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy if not exists "Owner manage - tasks"
  on public.crm_tasks for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy if not exists "Owner manage - conv_links"
  on public.crm_conversation_links for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
