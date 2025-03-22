import { Injectable, OnInit } from '@angular/core';
import { AuthService as OAuthService } from '@auth0/auth0-angular';
import { Observable } from 'rxjs';
import { UserState } from '../../store/user/user.state';
import { Store } from '@ngrx/store';
import { resetUser, setToken, setUser } from '../../store/user/user.actions';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public isAuthenticated$: Observable<boolean>;
  

  constructor(
    private oauthService: OAuthService, 
    private store: Store<UserState>
  ) {
    this.isAuthenticated$ = this.oauthService.isAuthenticated$;
    this.oauthService.user$.subscribe(user => {
      if(user) {
        this.store.dispatch(setUser({userState: user}));
        this.oauthService.getAccessTokenSilently().subscribe(token => {
          this.store.dispatch(setToken({token: token}))
        })
      }
    });
  }

  login(): void {
    this.oauthService.loginWithRedirect({
      authorizationParams: {
        audience: 'https://dev-nduro5lf8x5ddjgj.eu.auth0.com/api/v2/',
        redirect_uri: 'http://localhost:4200/callback'
      }
    });
  }

  logout(): void {
    this.store.dispatch(resetUser())
    this.oauthService.logout({logoutParams: {returnTo: 'http://localhost:4200/logout'}});
  }
}
