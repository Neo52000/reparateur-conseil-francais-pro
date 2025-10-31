-- Create secure function to check user roles (SECURITY DEFINER to bypass RLS)
create or replace function public.has_role(_user_id uuid, _role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
      and is_active = true
  )
$$;

-- Drop existing RLS policies on blog_automation_schedules
drop policy if exists "Admins can view schedules" on public.blog_automation_schedules;
drop policy if exists "Admins can insert schedules" on public.blog_automation_schedules;
drop policy if exists "Admins can update schedules" on public.blog_automation_schedules;
drop policy if exists "Admins can delete schedules" on public.blog_automation_schedules;

-- Create new RLS policies using the secure function
create policy "admin_select_blog_automation_schedules"
on public.blog_automation_schedules
for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "admin_insert_blog_automation_schedules"
on public.blog_automation_schedules
for insert to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "admin_update_blog_automation_schedules"
on public.blog_automation_schedules
for update to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "admin_delete_blog_automation_schedules"
on public.blog_automation_schedules
for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));