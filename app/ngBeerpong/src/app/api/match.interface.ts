// match.interface.ts

interface Match {
    gameId: number;
    type: string;
    groupNumber: string;
    homeTeam: string;
    awayTeam: string;
    pointsHome: number;
    pointsAway: number;
    updatedAt: Date;
    createdAt: Date;
  }
  
  export default Match;
  