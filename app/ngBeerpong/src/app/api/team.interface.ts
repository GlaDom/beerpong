// team.interface.ts

interface Team {
    id: number;
    gameId: number;
    teamName: string;
    groupName: string;
    points: number;
    rank: number;
    createdAt: Date;
  }
  
  export default Team;
  