import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { mergeMap, catchError } from 'rxjs';

export const headersInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  
  // Nur für API-Anfragen Token hinzufügen
  // Passe die URL-Bedingung an deine API-Basis-URL an
  if (!req.url.includes('localhost:8082/api')) {
    return next(req);
  }
  
  return auth.getAccessTokenSilently({
    authorizationParams: {
      audience: 'https://skbeerpongtst.com/api',
      redirect_uri: 'https://skbeerpong.com:4200/callback',
    }
  }).pipe(
    mergeMap(token => {
      // Anfrage mit Authorization-Header klonen
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return next(authReq);
    }),
    catchError(error => {
      console.error('Fehler beim Abrufen des Access Tokens:', error);
      // Im Fehlerfall die Anfrage ohne Token fortsetzen
      return next(req);
    })
  );
};
