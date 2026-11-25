create table videos (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  title text, category text, description text, video_url text, thumbnail_url text
);
create table inquiries (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  name text, email text, message text
);
create table settings (key text primary key, value jsonb);
alter table videos enable row level security;
alter table inquiries enable row level security;
alter table settings enable row level security;
