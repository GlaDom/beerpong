CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  mode INTEGER,
  amount_of_teams INTEGER,
  is_finished BOOLEAN,
  created_at TIMESTAMP
);

CREATE TABLE teams (
  game_id INTEGER PRIMARY KEY,
  team_name VARCHAR(255),
  group_name VARCHAR(255),
  points INTEGER,
  rank INTEGER,
  created_at TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id)
);

CREATE TABLE matches (
  game_id INTEGER,
  type VARCHAR(255),
  group_number INTEGER,
  home_team VARCHAR(255),
  away_team VARCHAR(255),
  points_home INTEGER,
  points_away INTEGER,
  created_at TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id)
);
