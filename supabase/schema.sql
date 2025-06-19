-- Database schema for Notion Template Shop

-- Drop tables if they already exist (optional)
drop table if exists orders cascade;
drop table if exists templates cascade;
drop table if exists vendors cascade;
drop table if exists users cascade;

-- Users table
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique
);

-- Vendors belong to users
create table if not exists vendors (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  stripe_account_id text
);

-- Templates sold by vendors
create table if not exists templates (
  id uuid primary key default uuid_generate_v4(),
  vendor_id uuid references vendors(id) on delete cascade,
  price numeric(10,2) not null,
  notion_url text not null
);

-- Orders for templates
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid references templates(id) on delete cascade,
  buyer_email text not null,
  stripe_session_id text not null,
  amount numeric(10,2) not null,
  created_at timestamptz default current_timestamp
);

create index if not exists orders_email_idx on orders(buyer_email);

-- Row level security: vendors may read only their own templates
alter table templates enable row level security;

create policy "Vendor can read own templates" on templates
  for select
  using (
    exists (
      select 1
      from vendors v
      where v.id = templates.vendor_id
        and v.user_id = auth.uid()
    )
  );
