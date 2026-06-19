-- CortexAI Supabase Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- TABLE: documents
-- ============================================================
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_type text not null check (file_type in ('csv', 'xlsx', 'xls', 'txt', 'pdf', 'jpg', 'jpeg', 'png')),
  raw_text text,
  structured boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- TABLE: customers
-- ============================================================
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  phone text,
  amount_owed numeric default 0,
  last_order date,
  status text default 'active' check (status in ('active', 'inactive', 'pending')),
  created_at timestamptz default now()
);

-- ============================================================
-- TABLE: orders
-- ============================================================
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_id text unique,
  customer_name text not null,
  item text not null,
  quantity numeric default 1,
  due_date date,
  status text default 'pending' check (status in ('pending', 'completed', 'overdue')),
  created_at timestamptz default now()
);

-- ============================================================
-- TABLE: suppliers
-- ============================================================
create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  supplier_name text not null,
  item text not null,
  unit_price numeric not null,
  lead_time text,
  created_at timestamptz default now(),
  unique(supplier_name, item)
);

-- ============================================================
-- TABLE: follow_ups
-- ============================================================
create table if not exists follow_ups (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('payment', 'order', 'customer', 'supplier')),
  title text not null,
  description text,
  due_date date,
  status text default 'pending' check (status in ('pending', 'done')),
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table documents enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table suppliers enable row level security;
alter table follow_ups enable row level security;

-- Authenticated users have full access to all tables (single-company MVP)
create policy "Authenticated full access documents"
  on documents for all to authenticated
  using (true) with check (true);

create policy "Authenticated full access customers"
  on customers for all to authenticated
  using (true) with check (true);

create policy "Authenticated full access orders"
  on orders for all to authenticated
  using (true) with check (true);

create policy "Authenticated full access suppliers"
  on suppliers for all to authenticated
  using (true) with check (true);

create policy "Authenticated full access follow_ups"
  on follow_ups for all to authenticated
  using (true) with check (true);

-- ============================================================
-- INDEXES (for faster search queries)
-- ============================================================

create index if not exists idx_customers_name on customers using gin(to_tsvector('english', name));
create index if not exists idx_orders_customer_name on orders(customer_name);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_suppliers_item on suppliers(item);
create index if not exists idx_follow_ups_status on follow_ups(status);
create index if not exists idx_follow_ups_due_date on follow_ups(due_date);
