import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { map, Observable, of, switchMap, tap } from 'rxjs';

export interface User {
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
  // user objekt halten und erst auf bereits loggedIn zu ueberpruefen
  // und zusaetzlich token auf expired ueberpruefen um gegebenenfalls refresh token zu holen

  constructor(
    private authService: AuthService,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    console.log('Authguradservice hit fuer url: ', state.url)
    sessionStorage.setItem('redirectUrl', state.url);
    return this.authService.isAuthenticated$.pipe(
      switchMap(loggedIn => {
        console.log('authguardservice check', loggedIn);
        
        if (loggedIn) {
          console.log('logged in, restore user state')
          // Versuche, den Benutzerstatus wiederherzustellen
          return this.authService.restoreUserState().pipe(
            map(restored => {
              if (!restored) {
                this.authService.login();
              }
              return restored; // true wenn wiederhergestellt, false wenn Login-Redirect
            })
          );
        } else {
          console.log('not logged in, try to restore user state')
          // Versuche, den Benutzerstatus wiederherzustellen
          return this.authService.restoreUserState().pipe(
            map(restored => {
              if (!restored) {
                this.authService.login();
              }
              return restored; // true wenn wiederhergestellt, false wenn Login-Redirect
            })
          );
        }
      })
    );
  }
}
