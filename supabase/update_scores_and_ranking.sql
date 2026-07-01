-- Atualiza os jogos passados e o ranking base do bolao.
-- Execute este arquivo no SQL Editor do Supabase.

insert into matches (api_id, opponent, opponent_flag, match_date, brazil_score, opponent_score, status, is_finished)
values
  (1001, 'Marrocos', '🏳', '2026-06-13T16:00:00Z', 1, 1, 'FT', true),
  (1002, 'Haiti', '🏳', '2026-06-19T16:00:00Z', 3, 0, 'FT', true),
  (1003, 'Escocia', '🏳', '2026-06-24T16:00:00Z', 3, 0, 'FT', true),
  (1004, 'Japao', '🏳', '2026-06-29T16:00:00Z', 2, 1, 'FT', true),
  (1005, 'A definir', '❓', '2026-07-04T16:00:00Z', null, null, 'NS', false)
on conflict (api_id) do update set
  opponent = excluded.opponent,
  opponent_flag = excluded.opponent_flag,
  match_date = excluded.match_date,
  brazil_score = excluded.brazil_score,
  opponent_score = excluded.opponent_score,
  status = excluded.status,
  is_finished = excluded.is_finished;

insert into rankings (participant_id, participant_name, sector, total_points, exact_scores, correct_outcomes)
select p.id, v.participant_name, v.sector, v.total_points, v.exact_scores, v.correct_outcomes
from (
  values
    ('Adrianne', 'Transfusao', 3, 3, 3),
    ('Fran', 'Coleta', 1, 1, 1),
    ('Stefany', 'Qualidade', 2, 2, 2),
    ('Noel', 'Transfusao', 1, 1, 1),
    ('Denise', 'Transfusao', 2, 2, 2),
    ('Huainny', 'Transfusao', 1, 1, 1),
    ('Andreza', 'Transfusao', 1, 1, 1),
    ('Wilson', 'Coordenador', 1, 1, 1),
    ('Regineide', 'Transfusao', 1, 1, 1),
    ('Rafael', 'Transfusao', 1, 1, 1),
    ('Carol', 'Liberacao', 1, 1, 1),
    ('Giza', 'Coleta', 1, 1, 1)
) as v(participant_name, sector, total_points, exact_scores, correct_outcomes)
join participants p on lower(p.name) = lower(v.participant_name)
on conflict (participant_id) do update set
  participant_name = excluded.participant_name,
  sector = excluded.sector,
  total_points = excluded.total_points,
  exact_scores = excluded.exact_scores,
  correct_outcomes = excluded.correct_outcomes,
  updated_at = now();

