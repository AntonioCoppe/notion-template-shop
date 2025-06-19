-- 1) Enable pgcrypto for UUID generation
create extension if not exists pgcrypto;

-- 2) Drop old tables (in case you’re re-running)
drop table if exists orders cascade;
drop table if exists templates cascade;
drop table if exists vendors cascade;
drop table if exists buyers cascade;
drop table if exists users cascade;

-- 3) Re-create tables with secure defaults

-- Users
create table public.users (
  id    uuid    primary key default gen_random_uuid(),
  email text    not null unique,
  role  text
);

-- Vendors (linked to users)
create table public.vendors (
  id                uuid    primary key default gen_random_uuid(),
  user_id           uuid    references public.users(id) on delete cascade,
  stripe_account_id text
);

-- Buyers (linked to users)
create table public.buyers (
  id      uuid    primary key default gen_random_uuid(),
  user_id uuid    references public.users(id) on delete cascade
);

-- Templates (sold by vendors)
create table public.templates (
  id         uuid    primary key default gen_random_uuid(),
  vendor_id  uuid    references public.vendors(id) on delete cascade,
  price      numeric(10,2) not null,
  notion_url text    not null
);

-- Orders (for templates)
create table public.orders (
  id                uuid       primary key default gen_random_uuid(),
  template_id       uuid       references public.templates(id) on delete cascade,
  buyer_email       text       not null,
  stripe_session_id text       not null,
  amount            numeric(10,2) not null,
  created_at        timestamptz    default current_timestamp
);

-- Index to speed up lookups by buyer_email
create index if not exists orders_email_idx on public.orders(buyer_email);

-- 4) Row-Level Security on templates
alter table public.templates enable row level security;

create policy "Vendor can read own templates"
  on public.templates
  for select
  using (
    exists (
      select 1
        from public.vendors v
       where v.id = public.templates.vendor_id
         and v.user_id = auth.uid()
    )
  );

-- 5) Trigger to sync new Auth users into your tables

create or replace function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
as $$
begin
  -- insert into users (if email conflict, skip)
  insert into public.users (id, email, role)
    values (
      new.id,
      new.email,
      new.raw_user_meta_data ->> 'role'
    )
    on conflict (email) do nothing;

  -- if vendor, add to vendors
  if new.raw_user_meta_data ->> 'role' = 'vendor' then
    insert into public.vendors (user_id)
      values (new.id);
  -- if buyer, add to buyers
  elsif new.raw_user_meta_data ->> 'role' = 'buyer' then
    insert into public.buyers (user_id)
      values (new.id);
  end if;

  return new;
end;
$$;

-- wire up the trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();
