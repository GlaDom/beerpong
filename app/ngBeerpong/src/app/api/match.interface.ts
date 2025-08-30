// match.interface.ts
// interface Match {
//   game_id: number;
//   match_id?: number;
//   type: string;
//   group_number: string;
//   home_team: string;
//   away_team: string;
//   points_home: number;
//   points_away: number;
//   referee?: string;
//   start_time?: Date;
//   end_time?: Date;
//   updated_at?: Date;
//   created_at?: Date;
// }
  
// export default Match;

// Match Interface
export interface Match {
  id?: number;
  tournament_id: number;
  match_id?: number;
  type: string;
  group_number: string;
  home_team: string;
  away_team: string;
  points_home: number;
  points_away: number;
  start_time: string; // ISO 8601 date string
  end_time?: string; // ISO 8601 date string
  referee?: string;
  updated_at?: string; // ISO 8601 date string
  created_at?: string; // ISO 8601 date string
}