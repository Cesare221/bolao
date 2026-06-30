-- Allow the browser admin flow to create and update matches directly in Supabase.
-- This keeps hosted changes out of the local fallback and avoids "Teste local"
-- records when the admin creates or edits a real game.

alter table matches enable row level security;
alter table rankings enable row level security;

drop policy if exists "Public insert matches" on matches;
drop policy if exists "Public update matches" on matches;
drop policy if exists "Public insert rankings" on rankings;
drop policy if exists "Public update rankings" on rankings;

create policy "Public insert matches"
  on matches
  for insert
  with check (true);

create policy "Public update matches"
  on matches
  for update
  using (true)
  with check (true);

create policy "Public insert rankings"
  on rankings
  for insert
  with check (true);

create policy "Public update rankings"
  on rankings
  for update
  using (true)
  with check (true);
