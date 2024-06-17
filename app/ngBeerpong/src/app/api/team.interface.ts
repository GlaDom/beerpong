// team.interface.ts

interface Team {
  id?: number;
  game_id?: number;
  team_name: string;
  group_name: string;
  points: number;
  cups_hit: number;
  cups_get: number;
  rank: number;
  created_at?: Date;
}

export default Team;
  