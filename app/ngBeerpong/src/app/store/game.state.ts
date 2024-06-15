import Group from "../api/group.interface";
import Match from "../api/match.interface";

export type Status = 'notset' | 'success' | 'failed' | undefined

export interface BeerpongGame {
    groups: Group[],
    matches: Match[],
    toastStatus: Status,
}