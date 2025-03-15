import { Injectable, OnInit } from '@angular/core';
import { AuthService as OAuthService } from '@auth0/auth0-angular';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnInit {
  public isAuthenticated$: Observable<boolean>;
  

  constructor(private oauthService: OAuthService) {
    this.isAuthenticated$ = this.oauthService.isAuthenticated$;
    this.oauthService.user$.subscribe(user => {
      console.log('user', user);
    });
  }

  ngOnInit(): void {
  }

  login(): void {
    console.log('login with redirect');
    this.oauthService.loginWithRedirect({
      authorizationParams: {
        audience: 'https://dev-nduro5lf8x5ddjgj.eu.auth0.com/api/v2/',
        redirect_uri: 'http://localhost:4200/callback'
      }
    });
  }
}
