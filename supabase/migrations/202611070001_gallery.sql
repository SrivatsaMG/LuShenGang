create table if not exists public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  discord_user_id text not null,
  username text not null,
  object_path text not null unique,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  size_bytes integer not null check (size_bytes > 0 and size_bytes <= 8388608),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text
);

create index if not exists gallery_photos_status_created_at_idx
  on public.gallery_photos (status, created_at desc);
create index if not exists gallery_photos_user_created_at_idx
  on public.gallery_photos (discord_user_id, created_at desc);

alter table public.gallery_photos enable row level security;
revoke all on table public.gallery_photos from anon, authenticated;
grant all on table public.gallery_photos to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gang-gallery',
  'gang-gallery',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = false,
    file_size_limit = 8388608,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];
