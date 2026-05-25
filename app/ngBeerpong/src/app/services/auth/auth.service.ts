import { Injectable, inject } from '@angular/core';
import { AuthService as OAuthService } from '@auth0/auth0-angular';
import { Observable, of } from 'rxjs';
import { UserState, UserStore } from '../../store/user/user.store';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'auth_user_state';
  private readonly TOKEN_EXPIRY_BUFFER = 60000;
  private userState: UserState | null = null;

  public isAuthenticated$: Observable<boolean>;

  private userStore = inject(UserStore);

  constructor(
    private oauthService: OAuthService,
    private router: Router
  ) {
    console.log('AuthService initialized');
    this.isAuthenticated$ = this.oauthService.isAuthenticated$;
    this.oauthService.user$.subscribe(user => {
      if (user) {
        this.userStore.setUser(user);
        this.userState = { userDetails: user, isLoggedIn: true, bearerToken: '' };
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.userState));
        console.log('User state cached successfully');
        this.oauthService.getAccessTokenSilently({
          authorizationParams: {
            audience: 'https://skbeerpongtst.com/api',
            redirect_uri: 'https://skbeerpong.com:4200/callback',
          }
        }).subscribe(token => {
          if (!token) return;
          this.userStore.setToken(token);
          this.userState!.bearerToken = token;
          sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.userState));
          console.log('Token cached successfully');
          const redirectUrl = sessionStorage.getItem('redirectUrl');
          if (redirectUrl) {
            this.router.navigate([redirectUrl]);
          }
        });
      }
    });
  }

  get authToken(): string {
    return this.userStore.bearerToken();
  }

  login(): void {
    this.oauthService.loginWithRedirect({
      authorizationParams: {
        audience: 'https://dev-nduro5lf8x5ddjgj.eu.auth0.com/api/v2/',
        redirect_uri: 'https://skbeerpong.com:4200/callback'
      }
    });
  }

  logout(): void {
    this.userStore.resetUser();
    this.oauthService.logout({ logoutParams: { returnTo: 'https://skbeerpong.com:4200/logout' } });
  }

  public restoreUserState(): Observable<boolean> {
    const cachedStateStr = sessionStorage.getItem(this.STORAGE_KEY);
    if (!cachedStateStr) {
      console.log('No cached user state found');
      return of(false);
    }
    try {
      const cachedState: UserState = JSON.parse(cachedStateStr);
      const now = Date.now();
      if (this.getTokenExpiration(cachedState.bearerToken) - this.TOKEN_EXPIRY_BUFFER <= now) {
        console.log('Cached token has expired or will expire soon');
        sessionStorage.removeItem(this.STORAGE_KEY);
        return of(false);
      }
      console.log('Restoring user state from cache');
      this.userStore.setUser(cachedState.userDetails);
      this.userStore.setToken(cachedState.bearerToken);
      this.userState = cachedState;
      return of(true);
    } catch (error) {
      console.error('Failed to parse cached user state:', error);
      sessionStorage.removeItem(this.STORAGE_KEY);
      return of(false);
    }
  }

  private getTokenExpiration(token: string): number {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      return payload.exp * 1000;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return Date.now() + 3600000;
    }
  }

  public clearUserState(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    console.log('User state cleared');
  }
}
