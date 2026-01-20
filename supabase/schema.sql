-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Months Table
create table public.months (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null, -- e.g. "December 2025" or ISO "2025-12"
  opening_balance numeric default 0,
  closing_balance numeric default 0,
  status text default 'active', -- 'active', 'closed'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, name)
);

-- Transactions Table
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  month_id uuid references public.months(id) on delete cascade not null,
  type text not null check (type in ('credit', 'debit')),
  amount numeric not null,
  description text not null,
  category text, -- 'food', 'transport', 'family', 'subscription', 'debt', 'misc'
  transaction_date date default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security
alter table public.months enable row level security;
alter table public.transactions enable row level security;

-- Policies for Months
create policy "Users can view their own months" on public.months for select
  using (auth.uid() = user_id);

create policy "Users can insert their own months" on public.months for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own months" on public.months for update
  using (auth.uid() = user_id);

create policy "Users can delete their own months" on public.months for delete
  using (auth.uid() = user_id);

-- Policies for Transactions
create policy "Users can view their own transactions" on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own transactions" on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own transactions" on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own transactions" on public.transactions for delete
  using (auth.uid() = user_id);
