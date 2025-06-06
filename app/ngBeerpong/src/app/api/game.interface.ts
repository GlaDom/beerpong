// game.interface.ts

import { Referee } from "./referee";
import Team from "./team.interface";

interface Game {
  id?: number;
  user_sub: string;
  mode: number;
  amount_of_teams: number;
  is_finished: boolean;
  game_time: number;
  start_time?: Date;
  referee: Referee[];
  teams: Team[];
  updated_at?: Date;
  created_at?: Date;
}

export default Game;
  