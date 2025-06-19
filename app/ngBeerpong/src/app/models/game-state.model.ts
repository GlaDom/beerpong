import Game from "../api/game.interface";
import Group from "../api/group.interface";
import Match from "../api/match.interface";

export interface GameState {
    game: Game,
    groups: Group[],
    matches: Match[],
}