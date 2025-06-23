import { Team } from "./team.interface";


// Group Interface
export interface Group {
    group_id?: number;
    tournament_id?: number;
    group_name: string;
    teams: Team[];
    created_at?: string; // ISO 8601 date string
}

export default Group