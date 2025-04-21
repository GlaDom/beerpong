CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  user_sub VARCHAR(255),
  mode INTEGER,
  amount_of_teams INTEGER,
  is_finished BOOLEAN,
  game_time INTEGER,
  updated_at TIMESTAMP,
  created_at TIMESTAMP,
  start_time TIMESTAMP
);

CREATE TABLE modes (
  name VARCHAR(255) PRIMARY KEY,
  number_of_groups INTEGER,
  number_of_teams INTEGER,
  got_round_inbetween BOOLEAN,
  got_round_of_32 BOOLEAN,
  got_round_of_16 BOOLEAN,
  got_quater_final BOOLEAN,
  got_semi_final BOOLEAN,
  got_final BOOLEAN,
  description VARCHAR(255)
)

CREATE TABLE referees (
  id SERIAL PRIMARY KEY,
  game_id INTEGER,
  name VARCHAR(255),
  created_at TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id)
)

CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  game_id INTEGER,
  team_name VARCHAR(255),
  group_name VARCHAR(255),
  points INTEGER,
  rank INTEGER,
  cups_hit INTEGER,
  cups_get INTEGER,
  cup_difference INTEGER,
  created_at TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id)
);

CREATE TABLE matches (
  game_id INTEGER,
  match_id SERIAL,
  type VARCHAR(255),
  group_number VARCHAR(255),
  home_team VARCHAR(255),
  away_team VARCHAR(255),
  points_home INTEGER,
  points_away INTEGER,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  referee VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id)
);

INSERT INTO modes (name, number_of_groups, number_of_teams, got_round_inbetween, got_round_of_32, got_round_of_16, got_quater_final, got_semi_final, got_final, description)
values('SIXGROUPSFIVETEAMS', 6, 5, false, true, true, true, true, true, 'sechs gruppen mit je fuenf teams')

INSERT INTO modes (name, number_of_groups, number_of_teams, got_round_inbetween, got_round_of_32, got_round_of_16, got_quater_final, got_semi_final, got_final, description)
values('ONEGROUPFIVETEAMS', 1, 5, false, false, false, false, false, true, 'eine gruppe mit fuenf teams')