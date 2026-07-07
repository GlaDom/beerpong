import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { Match } from '../api/match.interface';
import { TeamUpdate } from '../api/team-update.interface';
import { NewTournament } from '../api/game-request';
import Group from '../api/group.interface';
import { Team } from '../api/team.interface';
import { GameState } from '../models/game-state.model';
import { EnvironmentService } from './env/environment.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  envService = inject(EnvironmentService);

  private url: string = this.envService.getApiUrl();

  constructor(public httpClient: HttpClient) { }

  CreateGame(game: NewTournament) {
    return this.httpClient.post<NewTournament>(this.url + "/tournament", game).pipe()
  }

  GetGame(url: string) {
    return this.httpClient.get<GameState>(this.url + "/tournament").pipe()
  }

  GetLastGame(url: string) {
    return this.httpClient.get<GameState>(this.url + "/tournament/last").pipe()
  }

  UpdateMatch(match: Match) {
    return this.httpClient.put<Match>(this.url + "/tournament/matches", match).pipe()
  }

  UpdateMatchesRoundOfSixteen(gameId: number) {
    return this.httpClient.put<string>(this.url + "/tournament/matches/round-of-sixteen/id=" + gameId, null).pipe()
  }

  UpdateMatchesQuaterfinals(gameId: number) {
    return this.httpClient.put<string>(this.url + "/tournament/matches/quaterfinals/id=" + gameId, null).pipe()
  }

  UpdateMatchesSemifinals(gameId: number) {
    return this.httpClient.put<string>(this.url + "/tournament/matches/semifinals/id=" + gameId, null).pipe()
  }

  UpdateMatchesFinal(gameId: number) {
    return this.httpClient.put<string>(this.url + "/tournament/matches/final/id=" + gameId, null).pipe()
  }

  UpdateTeams(teams: TeamUpdate[]) {
    return this.httpClient.put<TeamUpdate[]>(this.url + "/tournament/teams", { teams: teams }).pipe()
  }

  FinishGame(gameId: number) {
    console.log(gameId)
    return this.httpClient.put<string>(this.url + "/tournament/id=" + gameId, null).pipe()
  }

  sortMatches(matches: Match[]): Match[][] {
    const groupedMatches = new Map<string, Match[]>();

    matches
      .filter(match => match.type === 'regular' && match.group_number)
      .forEach(match => {
        const bucket = groupedMatches.get(match.group_number) ?? [];
        bucket.push(match);
        groupedMatches.set(match.group_number, bucket);
      });

    return [...groupedMatches.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([, groupMatches]) =>
        [...groupMatches].sort((a, b) => (a.match_id ?? 0) - (b.match_id ?? 0))
      );
  }

  filterMatches(filter: string, matches: Match[]): Match[] {
    let retval: Match[] = matches.filter(m => m.type == filter)
    return retval
  }

  sortTeamsbyPointsAndDifferenze(groups: Group[]): Team[] {
    let retval: Team[] = []
    groups.map(g => retval.push(...g.teams))
    retval.sort((a, b) => {
      if (a.points === b.points) {
        if (b.cup_difference && a.cup_difference) {
          return b.cup_difference - a.cup_difference;
        }
      }
      return b.points - a.points;
    });
    return retval.slice(0, 8)
  }

  sortTeamsbyDifference(teams: Team[]): Team[] {
    return teams.sort((a, b) => a.cup_difference - b.cup_difference)
  }

  getWinnersOfMatches(matches: Match[]): string[] {
    let retval: string[] = [];
    matches.map(m => {
      if (m.points_away > m.points_home) {
        retval.push(m.away_team)
      } else if (m.points_home > m.points_away) {
        retval.push(m.home_team)
      }
    })
    return retval
  }

  // sort teams by points and cup difference
  public sortTeamsByPointsAndCupDifference(teams: Team[]): Team[] {
    teams.sort((a, b) => {
      if (a.points === b.points) {
        if (b.cup_difference && a.cup_difference) {
          return b.cup_difference - a.cup_difference;
        }
      }
      return b.points - a.points;
    });
    return teams
  }

  sortTeamsInGroups(groups: Group[]): Group[] {
    return groups.map(group => ({
      ...group,
      teams: [...group.teams].sort((a, b) => {
        if (a.points === b.points) {
          return b.cup_difference - a.cup_difference;
        }
        return b.points - a.points;
      })
    }));
  }
}
