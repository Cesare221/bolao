-- Seed participants
INSERT INTO participants (name, sector, prediction_count) VALUES
  ('Adrianne', 'Transfusao', 3),
  ('Fran', 'Coleta', 1),
  ('Stefany', 'Qualidade', 2),
  ('Noel', 'Transfusao', 1),
  ('Denise', 'Transfusao', 2),
  ('Huainny', 'Transfusao', 1),
  ('Andreza', 'Transfusao', 1),
  ('Wilson', 'Coordenador', 1),
  ('Regineide', 'Transfusao', 1),
  ('Rafael', 'Transfusao', 1),
  ('Carol', 'Liberacao', 1),
  ('Giza', 'Coleta', 1)
ON CONFLICT DO NOTHING;

-- Seed matches for Brazil in the World Cup
INSERT INTO matches (api_id, opponent, opponent_flag, match_date, brazil_score, opponent_score, status, is_finished) VALUES
  (1001, 'Marrocos', '🇲🇦', '2026-06-13T16:00:00Z', 1, 1, 'FT', true),
  (1002, 'Haiti', '🇭🇹', '2026-06-19T16:00:00Z', 3, 0, 'FT', true),
  (1003, 'Escocia', '🏴', '2026-06-24T16:00:00Z', 3, 0, 'FT', true),
  (1004, 'Japao', '🇯🇵', '2026-06-29T16:00:00Z', 2, 1, 'FT', true),
  (1005, 'A definir', '❓', '2026-07-04T16:00:00Z', NULL, NULL, 'NS', false)
ON CONFLICT DO NOTHING;

-- Seed ranking with current points
INSERT INTO rankings (participant_id, participant_name, sector, total_points, exact_scores, correct_outcomes) VALUES
  ((SELECT id FROM participants WHERE name = 'Adrianne' LIMIT 1), 'Adrianne', 'Transfusao', 3, 3, 3),
  ((SELECT id FROM participants WHERE name = 'Fran' LIMIT 1), 'Fran', 'Coleta', 1, 1, 1),
  ((SELECT id FROM participants WHERE name = 'Stefany' LIMIT 1), 'Stefany', 'Qualidade', 2, 2, 2),
  ((SELECT id FROM participants WHERE name = 'Noel' LIMIT 1), 'Noel', 'Transfusao', 1, 1, 1),
  ((SELECT id FROM participants WHERE name = 'Denise' LIMIT 1), 'Denise', 'Transfusao', 2, 2, 2),
  ((SELECT id FROM participants WHERE name = 'Huainny' LIMIT 1), 'Huainny', 'Transfusao', 1, 1, 1),
  ((SELECT id FROM participants WHERE name = 'Andreza' LIMIT 1), 'Andreza', 'Transfusao', 1, 1, 1),
  ((SELECT id FROM participants WHERE name = 'Wilson' LIMIT 1), 'Wilson', 'Coordenador', 1, 1, 1),
  ((SELECT id FROM participants WHERE name = 'Regineide' LIMIT 1), 'Regineide', 'Transfusao', 1, 1, 1),
  ((SELECT id FROM participants WHERE name = 'Rafael' LIMIT 1), 'Rafael', 'Transfusao', 1, 1, 1),
  ((SELECT id FROM participants WHERE name = 'Carol' LIMIT 1), 'Carol', 'Liberacao', 1, 1, 1),
  ((SELECT id FROM participants WHERE name = 'Giza' LIMIT 1), 'Giza', 'Coleta', 1, 1, 1)
ON CONFLICT DO NOTHING;
