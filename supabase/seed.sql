-- Seed participants
INSERT INTO participants (name, sector, prediction_count) VALUES
  ('Adrianne', 'Transfusão', 3),
  ('Fran', 'Coleta', 1),
  ('Stefany', 'Qualidade', 2),
  ('Noel', 'Transfusão', 1),
  ('Denise', 'Transfusão', 2),
  ('Huainny', 'Transfusão', 1),
  ('Andreza', 'Transfusão', 1),
  ('Wilson', 'Coordenador', 1),
  ('Regineide', 'Transfusão', 1),
  ('Rafael', 'Transfusão', 1),
  ('Carol', 'Liberação', 1),
  ('Giza', 'Coleta', 1)
ON CONFLICT DO NOTHING;
