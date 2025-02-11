-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create tables
create table public.notes (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null
);

create table public.tags (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.notes_tags (
  note_id uuid references public.notes on delete cascade,
  tag_id uuid references public.tags on delete cascade,
  primary key (note_id, tag_id)
);

-- Enable RLS
alter table public.notes enable row level security;
alter table public.tags enable row level security;
alter table public.notes_tags enable row level security;

-- Create RLS policies
create policy "Users can view their own notes" on notes
  for select using (auth.uid() = user_id);

create policy "Users can insert their own notes" on notes
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own notes" on notes
  for update using (auth.uid() = user_id);

create policy "Users can delete their own notes" on notes
  for delete using (auth.uid() = user_id);

-- Tags are public
create policy "Tags are viewable by everyone" on tags
  for select using (true);

create policy "Tags are insertable by everyone" on tags
  for insert with check (true);

-- Notes-tags junction
create policy "Users can view their notes' tags" on notes_tags
  for select using (
    exists (
      select 1 from notes
      where notes.id = notes_tags.note_id
      and notes.user_id = auth.uid()
    )
  );

create policy "Users can insert tags for their notes" on notes_tags
  for insert with check (
    exists (
      select 1 from notes
      where notes.id = notes_tags.note_id
      and notes.user_id = auth.uid()
    )
  );

create policy "Users can delete tags from their notes" on notes_tags
  for delete using (
    exists (
      select 1 from notes
      where notes.id = notes_tags.note_id
      and notes.user_id = auth.uid()
    )
  );