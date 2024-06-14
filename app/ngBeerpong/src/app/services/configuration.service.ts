import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { BeerpongGame } from '../store/game.state';
import Match from '../api/match.interface';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  private url: string = "http://localhost:8080/api/v1";

  constructor(public httpClient: HttpClient) { }

  GetGame(url: string) {
    return this.httpClient.get<BeerpongGame>(this.url+"/getGame").pipe()
  }

  UpdateMatch(match: Match) {
    return this.httpClient.put<Match>(this.url+"/updateMatches", match).pipe()
  }

  sortMatches(matches: Match[]): Match[][] {
    let retval: Match[][] = [[], [], [], [], [], []]
    for(let i = 0;i<matches.length;i++) {
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
