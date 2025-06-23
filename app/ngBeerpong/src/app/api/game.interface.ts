// game.interface.ts

import Group from "./group.interface";
import {Match} from "./match.interface";
import { Referee } from "./referee";
import { Team } from "./team.interface";

// interface Game {
//   id?: number;
//   user_sub: string;
//   mode: number;
//   amount_of_teams: number;
//   is_finished: boolean;
//   game_time: number;
//   start_time?: Date;
//   referee: Referee[] | null;
//   teams: Team[];
//   updated_at?: Date;
//   created_at?: Date;
// }

// export default Game;

// Tournament Interface
export interface Tournament {
  id?: number;
  user_sub: string;
  amount_of_teams: number;
  groups: Group[];
  matches?: Match[];
  is_finished: boolean;
  got_ko_stage: boolean;
  got_stage_in_between: boolean;
  number_of_qualified_teams: number;
  include_third_place_match: boolean;
  game_time: number; // Duration in nanoseconds
  start_time: string; // ISO 8601 date string
  referee: Referee[];
  updated_at?: string; // ISO 8601 date string
  created_at?: string; // ISO 8601 date string
}