// match.interface.ts

interface Match {
    game_id: number;
    match_id?: number;
    type: string;
    group_number: string;
    home_team: string;
    away_team: string;
    points_home: number;
    points_away: number;
    referee?: string;
    start_time?: Date;
    end_time?: Date;
    updated_at?: Date;
    created_at?: Date;
  }
  
  export default Match;
  