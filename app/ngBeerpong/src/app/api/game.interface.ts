// game.interface.ts

interface Game {
  id: number;
  mode: number;
  amountOfTeams: number;
  isFinished: boolean;
  updatedAt: Date;
  createdAt: Date;
}

export default Game;
  