import Game from "../api/game.interface";
import Group from "../api/group.interface";
import Match from "../api/match.interface";

export type Status = 'notset' | 
                    'success match updated' | 
                    'failed match updated' | 
                    "success update round of 16" | 
                    "failed update round of 16" | 
                    "success update quater finals" |
                    "failed update quater finals" |
                    "success update semi finals" |
                    "failed update semi finals"|
                    "success update final" |
                    "failed update final" |
                    "success game finished" |
                    "failed game finished" |
                    undefined



export interface BeerpongState {
    game: Game,
    groups: Group[],
    matches: Match[],
    toastStatus: Status,
    isLoading: boolean,
    showRanking: boolean
}