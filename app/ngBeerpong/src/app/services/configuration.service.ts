import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { BeerpongGame } from '../store/game.state';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  private url: string = "http://localhost:8080/api/v1";

  constructor(public httpClient: HttpClient) { }

  GetGame(url: string) {
    return this.httpClient.get<BeerpongGame>(url+"/getGame").pipe()
  }
}
