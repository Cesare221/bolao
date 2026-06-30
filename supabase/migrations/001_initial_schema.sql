-- participants
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sector TEXT,
  prediction_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- matches
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id INT UNIQUE,
  opponent TEXT NOT NULL,
  opponent_flag TEXT,
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  brazil_score INT,
  opponent_score INT,
  status TEXT DEFAULT 'NS',
  is_finished BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- predictions
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  brazil_score INT NOT NULL,
  opponent_score INT NOT NULL,
  points INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (participant_id, match_id)
);

-- rankings
CREATE TABLE rankings (
  participant_id UUID PRIMARY KEY REFERENCES participants(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  sector TEXT,
  total_points INT DEFAULT 0,
  exact_scores INT DEFAULT 0,
  correct_outcomes INT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- indexes
CREATE INDEX idx_matches_match_date ON matches(match_date);
CREATE INDEX idx_predictions_participant ON predictions(participant_id);

-- Trigger to auto-increment prediction_count
CREATE OR REPLACE FUNCTION increment_prediction_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE participants
  SET prediction_count = prediction_count + 1
  WHERE id = NEW.participant_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS increment_prediction_count ON predictions;

CREATE TRIGGER increment_prediction_count
AFTER INSERT ON predictions
FOR EACH ROW
EXECUTE FUNCTION increment_prediction_count();
