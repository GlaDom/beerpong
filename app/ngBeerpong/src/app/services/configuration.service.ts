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
}
