import {Tournament} from "../api/game.interface";
import Group from "../api/group.interface";
import {Match} from "../api/match.interface";

export interface GameState {
    game: Tournament,
    groups: Group[],
    matches: Match[],
}