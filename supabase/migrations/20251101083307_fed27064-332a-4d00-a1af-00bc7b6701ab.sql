-- Ensure has_role function exists for secure role checks
create or replace function public.has_role(_user_id uuid, _role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = _user_id
      and ur.role = _role
      and coalesce(ur.is_active, true) = true
  );
$$;

-- Enable RLS on blog_automation_schedules (safe if already enabled)
alter table if exists public.blog_automation_schedules enable row level security;

-- Clean existing policies (if any) to avoid duplicates
drop policy if exists "Admins can view schedules" on public.blog_automation_schedules;
drop policy if exists "Admins can insert schedules" on public.blog_automation_schedules;
drop policy if exists "Admins can update schedules" on public.blog_automation_schedules;
drop policy if exists "Admins can delete schedules" on public.blog_automation_schedules;

-- Admins can view schedules
create policy "Admins can view schedules"
  on public.blog_automation_schedules
  for select
  using (public.has_role(auth.uid(), 'admin'));

-- Admins can insert schedules
create policy "Admins can insert schedules"
  on public.blog_automation_schedules
  for insert
  with check (public.has_role(auth.uid(), 'admin'));

-- Admins can update schedules
create policy "Admins can update schedules"
  on public.blog_automation_schedules
  for update
  using (public.has_role(auth.uid(), 'admin'));

-- Admins can delete schedules
create policy "Admins can delete schedules"
  on public.blog_automation_schedules
  for delete
  using (public.has_role(auth.uid(), 'admin'));
