-- Create a 'scenes' table
create table public.scenes (
  id uuid primary key default gen_random_uuid(),
  roomId text unique not null,
  sceneVersion int not null,
  ciphertext jsonb not null,
  iv jsonb not null,
  created_at timestamp default now()
);
-- Set RLS policies in case authentication is needed, otherwise allow public access
-- Create a storage bucket 'files' with appropriate policies or public access