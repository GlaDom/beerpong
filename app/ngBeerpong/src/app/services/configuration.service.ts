import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  private url: string = "http://localhost:8080/";

  constructor(public httpClient: HttpClient) { }

  GetGame(url: string) {
    return this.httpClient.get(url).pipe()
  }
}
