import { Injectable, OnInit } from '@angular/core';
import { AuthService as OAuthService } from '@auth0/auth0-angular';
import { Observable, of } from 'rxjs';
import { UserState } from '../../store/user/user.state';
import { Store } from '@ngrx/store';
import { resetUser, setToken, setUser } from '../../store/user/user.actions';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'auth_user_state';
  private readonly TOKEN_EXPIRY_BUFFER = 60000; // 1 Minute Puffer vor Ablauf
  private userState: UserState | null = null;
  
  public isAuthenticated$: Observable<boolean>;
  

  constructor(
    private oauthService: OAuthService, 
    private store: Store<UserState>,
    private router: Router
  ) {
    this.isAuthenticated$ = this.oauthService.isAuthenticated$;
    this.oauthService.user$.subscribe(user => {
      if(user) {
        if (!user) return ;

        this.store.dispatch(setUser({userState: user}));
        this.userState = {
          userDetails: user,
          isLoggedIn: true,
          bearerToken: '',
        }
        // Im SessionStorage speichern
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.userState));
        console.log('User state cached successfully');
        this.oauthService.getAccessTokenSilently({
          authorizationParams: {
            audience: 'https://skbeerpongtst.com/api',
            redirect_uri: 'https://skbeerpong.com:4200/callback',
          }
        }).subscribe(token => {
          if (!token) return ;
          this.store.dispatch(setToken({token: token}))
          this.userState!.bearerToken = token;
          // Im SessionStorage speichern
          sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.userState));
          console.log('Token cached successfully');
        })
      }
    });
  }

  get authToken(): string {
    console.log('get authToken', this.userState?.bearerToken);
    return this.userState?.bearerToken || '';
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
    this.store.dispatch(resetUser())
    this.oauthService.logout({logoutParams: {returnTo: 'https://skbeerpong.com:4200/logout'}});
  }

  /**
   * Versucht, den Benutzer aus dem Cache wiederherzustellen
   */
  public restoreUserState(): Observable<boolean> {
    const cachedStateStr = sessionStorage.getItem(this.STORAGE_KEY);
    
    if (!cachedStateStr) {
      console.log('No cached user state found');
      return of(false);
    }
    
    try {
      const cachedState: UserState = JSON.parse(cachedStateStr);
      
      // Prüfen, ob der Token noch gültig ist (mit Puffer)
      const now = Date.now();
      if (this.getTokenExpiration(cachedState.bearerToken) - this.TOKEN_EXPIRY_BUFFER <= now) {
        console.log('Cached token has expired or will expire soon');
        sessionStorage.removeItem(this.STORAGE_KEY);
        return of(false);
      }
      
      console.log('Restoring user state from cache');
      // Hier könntest du den User-Status in deiner App aktualisieren
      this.store.dispatch(setUser({userState: cachedState.userDetails}));
      this.store.dispatch(setToken({token: cachedState.bearerToken}));
      this.userState = cachedState
      
      return of(true);
    } catch (error) {
      console.error('Failed to parse cached user state:', error);
      sessionStorage.removeItem(this.STORAGE_KEY);
      return of(false);
    }
  }

  /**
   * Extrahiert das Ablaufdatum aus einem JWT-Token
   */
  private getTokenExpiration(token: string): number {
    try {
      // Token aufteilen und den Payload-Teil (zweiter Teil) nehmen
      const base64Url = token.split('.')[1];
      
      // Base64-URL zu regulärem Base64 konvertieren
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      
      // Base64 dekodieren und in JSON umwandeln
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      // JSON parsen
      const payload = JSON.parse(jsonPayload);
      // exp ist in Sekunden, wir brauchen Millisekunden
      return payload.exp * 1000;
    } catch (error) {
      console.error('Failed to decode token:', error);
      // Fallback: Token gilt für eine Stunde ab jetzt
      return Date.now() + 3600000;
    }
  }

  /**
   * Löscht den gespeicherten Benutzer beim Logout
   */
  public clearUserState(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    console.log('User state cleared');
  }
}
