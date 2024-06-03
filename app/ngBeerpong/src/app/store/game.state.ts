import Group from "../api/group.interface";
import Match from "../api/match.interface";

export interface BeerpongGame {
    groups: Group[],
    matches: Match[]
}