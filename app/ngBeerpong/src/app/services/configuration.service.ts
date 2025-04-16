import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { BeerpongState } from '../store/beerpong/game.state';
import Match from '../api/match.interface';
import TeamUpdate from '../api/team-update.interface';
import { GameRequest } from '../api/game-request';
import Group from '../api/group.interface';
import Team from '../api/team.interface';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  private url: string = "http://localhost:8082/api/v1";

  constructor(public httpClient: HttpClient) { }

  CreateGame(game: GameRequest) {
    return this.httpClient.post<GameRequest>(this.url+"/game", game).pipe()
  }

  GetGame(url: string) {
    return this.httpClient.get<BeerpongState>(this.url+"/game").pipe()
  }

  UpdateMatch(match: Match) {
    return this.httpClient.put<Match>(this.url+"/game/matches", match).pipe()
  }

  UpdateMatchesRoundOfSixteen(gameId: number) {
    return this.httpClient.put<string>(this.url+"/game/matches/round-of-sixteen/id="+gameId, null).pipe()
  }

  UpdateMatchesQuaterfinals(gameId: number) {
    return this.httpClient.put<string>(this.url+"/game/matches/quaterfinals/id="+gameId, null).pipe()
  }

  UpdateMatchesSemifinals(gameId: number) {
    return this.httpClient.put<string>(this.url+"/game/matches/semifinals/id="+gameId, null).pipe()
  }

  UpdateMatchesFinal(gameId: number, gameMode: number) {
    return this.httpClient.put<string>(this.url+"/game/matches/final/id="+gameId+"?mode="+gameMode, null).pipe()
  }

  UpdateTeams(teams: TeamUpdate[]) {
    return this.httpClient.put<TeamUpdate[]>(this.url+"/game/teams", {teams: teams}).pipe()
  }

  FinishGame(gameId: number) {
    console.log(gameId)
    return this.httpClient.put<string>(this.url+"/game/id="+gameId, null).pipe()
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

  sortTeamsbyPointsAndDifferenze(groups: Group[]): Team[] {
    let retval: Team[] = []
    groups.map(g => retval.push(...g.teams))
    retval.sort((a, b) => {
      if (a.points === b.points) {
        if(b.cup_difference && a.cup_difference){
          return b.cup_difference - a.cup_difference;
        }
      }
      return b.points - a.points;
    });
    return retval.slice(0,8)
  }

  sortTeamsbyDifference(teams: Team[]): Team[] {
    return teams.sort((a, b) => a.cup_difference - b.cup_difference)
  }

  getWinnersOfMatches(matches: Match[]): string[] {
    let retval: string[] = [];
    matches.map(m => {
      if(m.points_away > m.points_home) {
        retval.push(m.away_team)
      } else if(m.points_home > m.points_away) {
        retval.push(m.home_team)
      }
    })
    return retval
  }

  // sort teams by points and cup difference
  public sortTeamsByPointsAndCupDifference(teams: Team[]): Team[] {
    teams.sort((a, b) => {
      if (a.points === b.points) {
        if(b.cup_difference && a.cup_difference){
          return b.cup_difference - a.cup_difference;
        }
      }
      return b.points - a.points;
    });
    return teams
  }
}
