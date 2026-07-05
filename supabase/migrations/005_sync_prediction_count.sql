create or replace function refresh_participant_prediction_count(target_participant_id uuid)
returns void as $$
begin
  if target_participant_id is null then
    return;
  end if;

  update participants
  set prediction_count = (
    select count(*)
    from predictions
    where participant_id = target_participant_id
  )
  where id = target_participant_id;
end;
$$ language plpgsql;

create or replace function sync_prediction_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    perform refresh_participant_prediction_count(new.participant_id);
    return new;
  end if;

  if tg_op = 'DELETE' then
    perform refresh_participant_prediction_count(old.participant_id);
    return old;
  end if;

  if tg_op = 'UPDATE' then
    perform refresh_participant_prediction_count(old.participant_id);
    perform refresh_participant_prediction_count(new.participant_id);
    return new;
  end if;

  return null;
end;
$$ language plpgsql;

drop trigger if exists increment_prediction_count on predictions;
drop trigger if exists sync_prediction_count on predictions;

create trigger sync_prediction_count
after insert or update or delete on predictions
for each row
execute function sync_prediction_count();

update participants p
set prediction_count = (
  select count(*)
  from predictions pr
  where pr.participant_id = p.id
);
