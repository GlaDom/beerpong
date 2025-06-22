CREATE TABLE tournaments (
  id SERIAL PRIMARY KEY,
  user_sub VARCHAR(255),
  amount_of_teams INTEGER,
  got_stage_inbetween BOOLEAN,
  got_ko_stage BOOLEAN,
  number_of_qualified_teams INTEGER,
  include_third_place_match BOOLEAN,
  is_finished BOOLEAN,
  game_time INTEGER,
  updated_at TIMESTAMP,
  created_at TIMESTAMP,
  start_time TIMESTAMP
);

CREATE TABLE groups (
  group_id SERIAL PRIMARY KEY,
  tournament_id INTEGER,
  group_name VARCHAR(255),
  created_at TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
);

CREATE TABLE referees (
  id SERIAL PRIMARY KEY,
  tournament_id INTEGER,
  name VARCHAR(255),
  created_at TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
);

CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  group_id INTEGER,
  team_name VARCHAR(255),
  group_name VARCHAR(255),
  points INTEGER,
  rank INTEGER,
  cups_hit INTEGER,
  cups_get INTEGER,
  cup_difference INTEGER,
  created_at TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES groups(group_id)
);

CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  tournament_id INTEGER,
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
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
);

-- INSERT INTO modes (name, number_of_groups, number_of_teams, got_round_inbetween, got_round_of_32, got_round_of_16, got_quater_final, got_semi_final, got_final, description)
-- values('SIXGROUPSFIVETEAMS', 6, 5, false, true, true, true, true, true, 'sechs gruppen mit je fuenf teams')

-- INSERT INTO modes (name, number_of_groups, number_of_teams, got_round_inbetween, got_round_of_32, got_round_of_16, got_quater_final, got_semi_final, got_final, description)
-- values('ONEGROUPFIVETEAMS', 1, 5, false, false, false, false, false, true, 'eine gruppe mit fuenf teams')