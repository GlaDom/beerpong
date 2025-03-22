import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, tap } from 'rxjs';

export interface User {
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
  // user objekt halten und erst auf bereits loggedIn zu ueberpruefen
  // und zusaetzlich token auf expired ueberpruefen um gegebenenfalls refresh token zu holen

  constructor(private authService: AuthService) {}

  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      tap(loggedIn => {
        if (!loggedIn) {
          this.authService.login();
        } else {
          console.log(loggedIn);
        }
      })
    );
  }
}
