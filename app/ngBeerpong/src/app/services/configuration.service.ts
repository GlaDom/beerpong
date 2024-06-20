import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { BeerpongState } from '../store/game.state';
import Match from '../api/match.interface';
import TeamUpdate from '../api/team-update.interface';
import { GameRequest } from '../api/game-request';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  private url: string = "http://localhost:8080/api/v1";

  constructor(public httpClient: HttpClient) { }

  CreateGame(game: GameRequest) {
    return this.httpClient.post<GameRequest>(this.url+"/createGame", game).pipe()
  }

  GetGame(url: string) {
    return this.httpClient.get<BeerpongState>(this.url+"/getGame").pipe()
  }

  UpdateMatch(match: Match) {
    return this.httpClient.put<Match>(this.url+"/updateMatches", match).pipe()
  }

  UpdateMatchesRoundOfSixteen(gameId: number) {
    return this.httpClient.put<string>(this.url+"/updateMatchesRoundOfSixteen/id="+gameId, null).pipe()
  }

  UpdateMatchesQuaterfinals(gameId: number) {
    return this.httpClient.put<string>(this.url+"/updateMatchesQuaterfinals/id="+gameId, null).pipe()
  }

  UpdateMatchesSemifinals(gameId: number) {
    return this.httpClient.put<string>(this.url+"/updateMatchesSemifinals/id="+gameId, null).pipe()
  }

  UpdateMatchesFinal(gameId: number) {
    return this.httpClient.put<string>(this.url+"/updateMatchesFinals/id="+gameId, null).pipe()
  }

  UpdateTeams(teams: TeamUpdate[]) {
    return this.httpClient.put<TeamUpdate[]>(this.url+"/updateTeams", {teams: teams}).pipe()
  }

  FinishGame(gameId: number) {
    console.log(gameId)
    return this.httpClient.put<string>(this.url+"/finishGame/id="+gameId, null).pipe()
  }

  sortMatches(matches: Match[]): Match[][] {
    let retval: Match[][] = [[], [], [], [], [], []]
    for(let i = 0;i<matches.length;i++) {
      if(matches[i].type!=='regular') {
        break
      }
      switch(matches[i].group_number) {
        case "A": {
          retval[0].push(matches[i]);
          break;
        }
        case "B": {
          retval[1].push(matches[i]);
          break;
        }
        case "C": {
          retval[2].push(matches[i]);
          break;
        }
        case "D": {
          retval[3].push(matches[i]);
          break;
        }
        case "E": {
          retval[4].push(matches[i]);
          break;
        }
        case "F": {
          retval[5].push(matches[i]);
          break;
        }
        case "": {
          break;
        }
        default: 
          break
      }
    }
    return retval
  }

  filterMatches(filter: string, matches: Match[]): Match[] {
    let retval: Match[] = matches.filter(m => m.type==filter)
    return retval
  }
}
