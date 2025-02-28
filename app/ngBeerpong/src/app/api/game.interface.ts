// game.interface.ts

import { Referee } from "./referee";
import Team from "./team.interface";

interface Game {
  id?: number;
  mode: number;
  amount_of_teams: number;
  is_finished: boolean;
  game_time: number;
  start_time?: Date;
  referee: Referee[];
  teams: Team[];
  updatedAt?: Date;
  createdAt?: Date;
}

export default Game;
  