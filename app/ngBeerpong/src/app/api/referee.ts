// Referee Interface
export interface Referee {
  id?: number;
  tournament_id?: number;
  name: string;
  created_at?: string; // ISO 8601 date string
}