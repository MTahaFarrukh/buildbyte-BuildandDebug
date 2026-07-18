-- CareerGPS AI — Supabase schema
-- Run this in the Supabase SQL editor

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  career_path text default 'Software Engineer',
  career_score int default 35,
  theme text default 'dark',
  notifications_enabled boolean default true,
  bio text,
  avatar_url text,
  linkedin_url text,
  github_url text,
  portfolio_url text,
  badges text[] default array['newcomer'],
  skills text[] default '{}',
  completed_skills text[] default '{}',
  learning_hours numeric default 0,
  projects_built int default 0,
  resume_improvements int default 0,
  weekly_goal text,
  roadmap_progress int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  filename text,
  storage_path text,
  text_content text,
  analysis jsonb,
  created_at timestamptz default now()
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  role text not null,
  content text not null,
  created_at timestamptz default now()
);

create table if not exists roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  career_path text,
  data jsonb,
  created_at timestamptz default now()
);

-- Storage bucket: create 'resumes' bucket in Supabase Storage (private)
-- Enable Google provider under Authentication → Providers

alter table profiles enable row level security;
alter table resumes enable row level security;
alter table chat_messages enable row level security;
alter table roadmaps enable row level security;

create policy "Users manage own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users manage own resumes" on resumes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own chats" on chat_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own roadmaps" on roadmaps
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
