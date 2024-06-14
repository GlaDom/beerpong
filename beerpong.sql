CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  mode INTEGER,
  amount_of_teams INTEGER,
  is_finished BOOLEAN,
  updated_at TIMESTAMP,
  created_at TIMESTAMP
);

CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  game_id INTEGER,
  team_name VARCHAR(255),
  group_name VARCHAR(255),
  points INTEGER,
  rank INTEGER,
  cups_hit INTEGER,
  cups_get INTEGER,
  created_at TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id)
);

CREATE TABLE matches (
  game_id INTEGER,
  type VARCHAR(255),
  group_number VARCHAR(255),
  home_team VARCHAR(255),
  away_team VARCHAR(255),
  points_home INTEGER,
  points_away INTEGER,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id)
);
