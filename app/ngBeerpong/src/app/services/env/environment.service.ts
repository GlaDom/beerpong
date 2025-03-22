import { Injectable, InjectionToken } from '@angular/core';
import { Auth, IEnvironment } from '../../../environments/ienvironment';
import { environment } from '../../../environments/environment';

export const ENVIRONMENT = new InjectionToken<IEnvironment>('environment');

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {

  constructor() {}

  public getAuth(): Auth {
    return environment.auth;
  }
}
