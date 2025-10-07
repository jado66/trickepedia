-- Migration: Create user_wishlist table
-- Description: Stores tricks that users want to learn/master

create table if not exists public.user_wishlist (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  trick_id uuid not null,
  created_at timestamp with time zone not null default now(),
  constraint user_wishlist_pkey primary key (id),
  constraint user_wishlist_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade,
  constraint user_wishlist_trick_id_fkey foreign key (trick_id) references public.tricks (id) on delete cascade,
  constraint user_wishlist_unique unique (user_id, trick_id)
) tablespace pg_default;

-- Create indexes for better query performance
create index if not exists idx_user_wishlist_user_id on public.user_wishlist using btree (user_id) tablespace pg_default;
create index if not exists idx_user_wishlist_trick_id on public.user_wishlist using btree (trick_id) tablespace pg_default;
create index if not exists idx_user_wishlist_created_at on public.user_wishlist using btree (created_at desc) tablespace pg_default;

-- Enable Row Level Security
alter table public.user_wishlist enable row level security;

-- RLS Policies
-- Users can view their own wishlist
create policy "Users can view own wishlist"
  on public.user_wishlist
  for select
  using (auth.uid() = user_id);

-- Users can add to their own wishlist
create policy "Users can add to own wishlist"
  on public.user_wishlist
  for insert
  with check (auth.uid() = user_id);

-- Users can remove from their own wishlist
create policy "Users can remove from own wishlist"
  on public.user_wishlist
  for delete
  using (auth.uid() = user_id);

-- Comment on table
comment on table public.user_wishlist is 'Stores tricks that users want to learn or master';
