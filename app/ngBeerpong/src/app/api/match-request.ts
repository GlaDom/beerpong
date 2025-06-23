import {Match} from "./match.interface";

export interface MatchRequest {
    match: Match
}

export interface MatchUpdateRequest {
  matches: Match[];
}