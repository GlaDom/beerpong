
// interface TeamUpdate {
//     game_id: number;
//     team_name: string;
//     group_name: string;
//     points_to_add: number;
//     cups_hitted: number;
//     cups_got: number;
//   }
    
// export default TeamUpdate;

export interface TeamUpdate {
  tournament_id: number;
  team_name: string;
  group_name: string;
  points_to_add: number;
  cups_hitted: number;
  cups_got: number;
}

export interface TeamUpdateRequest {
  teams: TeamUpdate[];
}