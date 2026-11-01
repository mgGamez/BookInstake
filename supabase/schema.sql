-- Run this file in Supabase SQL Editor before enabling production AI access.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,
  title text not null check (char_length(title) between 1 and 255),
  source_type text not null default 'text' check (source_type in ('text', 'file', 'email')),
  source_text text,
  analysis jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workflows (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,
  name text not null check (char_length(name) between 1 and 160),
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workflow_steps (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  position integer not null check (position >= 0),
  label text not null check (char_length(label) between 1 and 500),
  config jsonb not null default '{}'::jsonb,
  unique (workflow_id, position)
);

create table if not exists public.ai_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task text not null check (task in ('document', 'workflow', 'email')),
  created_at timestamptz not null default now()
);

create index if not exists ai_requests_user_created_at_idx on public.ai_requests(user_id, created_at desc);

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.workspace_members where workspace_id = target_workspace_id and user_id = auth.uid());
$$;

create or replace function public.is_workspace_admin(target_workspace_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.workspace_members where workspace_id = target_workspace_id and user_id = auth.uid() and role in ('owner', 'admin'));
$$;

create or replace function public.create_workspace_owner()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role) values (new.id, new.created_by, 'owner');
  return new;
end;
$$;

drop trigger if exists workspaces_create_owner on public.workspaces;
create trigger workspaces_create_owner after insert on public.workspaces for each row execute function public.create_workspace_owner();

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at before update on public.documents for each row execute function public.set_updated_at();
drop trigger if exists workflows_set_updated_at on public.workflows;
create trigger workflows_set_updated_at before update on public.workflows for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.documents enable row level security;
alter table public.workflows enable row level security;
alter table public.workflow_steps enable row level security;
alter table public.ai_requests enable row level security;

create policy "profiles are visible to their owner" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "members can view their workspaces" on public.workspaces for select using (public.is_workspace_member(id));
create policy "users can create workspaces" on public.workspaces for insert with check (created_by = auth.uid());
create policy "members can view workspace members" on public.workspace_members for select using (public.is_workspace_member(workspace_id));
create policy "admins manage workspace members" on public.workspace_members for all using (public.is_workspace_admin(workspace_id));
create policy "members manage workspace documents" on public.documents for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "members manage workspace workflows" on public.workflows for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "members manage workflow steps" on public.workflow_steps for all using (exists (select 1 from public.workflows where id = workflow_id and public.is_workspace_member(workspace_id))) with check (exists (select 1 from public.workflows where id = workflow_id and public.is_workspace_member(workspace_id)));
create policy "users view their own AI history" on public.ai_requests for select using (user_id = auth.uid());

create or replace function public.check_and_record_ai_request(request_task text)
returns boolean language plpgsql security definer set search_path = public as $$
declare request_count integer;
begin
  if auth.uid() is null or request_task not in ('document', 'workflow', 'email') then return false; end if;
  select count(*) into request_count from public.ai_requests where user_id = auth.uid() and created_at > now() - interval '1 minute';
  if request_count >= 20 then return false; end if;
  insert into public.ai_requests (user_id, task) values (auth.uid(), request_task);
  return true;
end;
$$;
