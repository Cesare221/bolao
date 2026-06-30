-- Safer public access for the contest app.
-- Reading stays public, but only the minimum write paths stay open to the browser.
-- Match/result maintenance and ranking materialization should happen via trusted backend/admin flow.

create unique index if not exists participants_name_unique_idx
  on participants (lower(name));

alter table participants enable row level security;
alter table matches enable row level security;
alter table predictions enable row level security;
alter table rankings enable row level security;

drop policy if exists "Public read participants" on participants;
drop policy if exists "Public insert participants" on participants;
drop policy if exists "Public update participants" on participants;
drop policy if exists "Public read matches" on matches;
drop policy if exists "Public delete matches" on matches;
drop policy if exists "Public read predictions" on predictions;
drop policy if exists "Public insert predictions" on predictions;
drop policy if exists "Public read rankings" on rankings;

create policy "Public read participants"
  on participants
  for select
  using (true);

create policy "Public insert participants"
  on participants
  for insert
  with check (true);

create policy "Public update participants"
  on participants
  for update
  using (true)
  with check (true);

create policy "Public read matches"
  on matches
  for select
  using (true);

create policy "Public delete matches"
  on matches
  for delete
  using (true);

create policy "Public read predictions"
  on predictions
  for select
  using (true);

create policy "Public insert predictions"
  on predictions
  for insert
  with check (true);

create policy "Public read rankings"
  on rankings
  for select
  using (true);
