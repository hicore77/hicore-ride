-- Hicore Ride 0.24.0: Konten (Profil, Einstellungen, Bestzeiten, Fahrten mit FIT-Datei)
-- Einmal im Supabase-Dashboard ausführen: SQL Editor › New query › alles einfügen › Run.
-- Darf mehrfach ausgeführt werden (legt nur an, was fehlt, Regeln werden neu gesetzt).
-- Jede Tabelle hat Row Level Security: jeder sieht und ändert nur seine eigenen Zeilen.

-- Profil und Einstellungen (eine Zeile je Konto)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text check (char_length(name) <= 32),
  mass real,
  ftp int,
  hr_max int,
  settings jsonb not null default '{}'::jsonb,
  total_km real not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "profil lesen" on public.profiles;
drop policy if exists "profil anlegen" on public.profiles;
drop policy if exists "profil aendern" on public.profiles;
create policy "profil lesen" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profil anlegen" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profil aendern" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Fahrten (Kennzahlen; die FIT-Datei liegt im Speicher-Bucket "fit")
create table if not exists public.rides (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  started_at timestamptz not null,
  world text not null,
  world_name text,
  bike text,
  km real,
  dur_s int,
  elev_m int,
  avg_w int,
  max_w int,
  kj int,
  avg_hr int,
  max_hr int,
  avg_cad int,
  fit_path text,
  created_at timestamptz not null default now()
);
create index if not exists rides_user_time on public.rides (user_id, started_at desc);
alter table public.rides enable row level security;
drop policy if exists "fahrt lesen" on public.rides;
drop policy if exists "fahrt anlegen" on public.rides;
drop policy if exists "fahrt aendern" on public.rides;
drop policy if exists "fahrt loeschen" on public.rides;
create policy "fahrt lesen" on public.rides for select to authenticated using ((select auth.uid()) = user_id);
create policy "fahrt anlegen" on public.rides for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "fahrt aendern" on public.rides for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "fahrt loeschen" on public.rides for delete to authenticated using ((select auth.uid()) = user_id);

-- Bestzeiten der Bergwertungen und Sprints (je Welt und Segment die beste Zeit)
create table if not exists public.segment_bests (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  world text not null,
  seg text not null,
  t real not null check (t > 0),
  at timestamptz not null default now(),
  primary key (user_id, world, seg)
);
alter table public.segment_bests enable row level security;
drop policy if exists "bestzeit lesen" on public.segment_bests;
drop policy if exists "bestzeit anlegen" on public.segment_bests;
drop policy if exists "bestzeit aendern" on public.segment_bests;
create policy "bestzeit lesen" on public.segment_bests for select to authenticated using ((select auth.uid()) = user_id);
create policy "bestzeit anlegen" on public.segment_bests for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "bestzeit aendern" on public.segment_bests for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Speicher für FIT-Dateien: privat, Pfad <Konto-ID>/<Fahrt-ID>.fit
insert into storage.buckets (id, name, public, file_size_limit)
values ('fit', 'fit', false, 10485760)
on conflict (id) do nothing;
drop policy if exists "fit lesen" on storage.objects;
drop policy if exists "fit hochladen" on storage.objects;
drop policy if exists "fit loeschen" on storage.objects;
create policy "fit lesen" on storage.objects for select to authenticated
  using (bucket_id = 'fit' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "fit hochladen" on storage.objects for insert to authenticated
  with check (bucket_id = 'fit' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "fit loeschen" on storage.objects for delete to authenticated
  using (bucket_id = 'fit' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Konto selbst löschen (das Spiel löscht vorher die FIT-Dateien über die Speicher-Schnittstelle)
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'nicht angemeldet';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
