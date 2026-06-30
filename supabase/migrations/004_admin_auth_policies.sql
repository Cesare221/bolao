-- Restrict administrative writes to authenticated Supabase users whose email
-- exists in the admin_users allowlist.
--
-- Insert your admin email into this table after creating the Auth user:
--   insert into admin_users (email) values ('admin@seu-dominio.com');

create table if not exists admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table matches enable row level security;
alter table rankings enable row level security;

drop policy if exists "Public insert matches" on matches;
drop policy if exists "Public update matches" on matches;
drop policy if exists "Public delete matches" on matches;
drop policy if exists "Public insert rankings" on rankings;
drop policy if exists "Public update rankings" on rankings;

drop policy if exists "Admin insert matches" on matches;
drop policy if exists "Admin update matches" on matches;
drop policy if exists "Admin delete matches" on matches;
drop policy if exists "Admin insert rankings" on rankings;
drop policy if exists "Admin update rankings" on rankings;

create policy "Admin insert matches"
  on matches
  for insert
  with check (
    exists (
      select 1
      from admin_users
      where lower(email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "Admin update matches"
  on matches
  for update
  using (
    exists (
      select 1
      from admin_users
      where lower(email) = lower(auth.jwt() ->> 'email')
    )
  )
  with check (
    exists (
      select 1
      from admin_users
      where lower(email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "Admin delete matches"
  on matches
  for delete
  using (
    exists (
      select 1
      from admin_users
      where lower(email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "Admin insert rankings"
  on rankings
  for insert
  with check (
    exists (
      select 1
      from admin_users
      where lower(email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "Admin update rankings"
  on rankings
  for update
  using (
    exists (
      select 1
      from admin_users
      where lower(email) = lower(auth.jwt() ->> 'email')
    )
  )
  with check (
    exists (
      select 1
      from admin_users
      where lower(email) = lower(auth.jwt() ->> 'email')
    )
  );
