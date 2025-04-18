import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AppComponent } from './app/app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { beerpongReducer } from './app/store/beerpong/beerpong.reducer';
import { BeerpongEffects } from './app/store/beerpong/beerpong.effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideRouterStore } from '@ngrx/router-store';
import { authHttpInterceptorFn, provideAuth0 } from '@auth0/auth0-angular';
import { ENVIRONMENT } from './app/services/env/environment.service';
import { environment } from './environments/environment';
import { userReducer } from './app/store/user/user.reducer';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { routes } from './app.routes';
import { headersInterceptor } from './app/interceptors/headers.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserAnimationsModule),
    importProvidersFrom(BrowserModule),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.my-app-dark'
        }
      }
    }),
    provideEffects(BeerpongEffects),
    provideStore({
      userState: userReducer,
      beerpongState: beerpongReducer
    }),
    provideRouterStore(),
    provideStoreDevtools({
        maxAge: 25, // Retains last 25 states
        trace: false, //  If set to true, will include stack trace for every dispatched action, so you can see it in trace tab jumping directly to that part of code
        traceLimit: 75, // maximum stack trace frames to be stored (in case trace option was provided as true)
        connectInZone: true, // If set to true, the connection is established within the Angular zone
        logOnly: false
    }),
    // provideState({name: 'beerpongState', reducer: beerpongReducer}),
    provideHttpClient(withInterceptors([authHttpInterceptorFn])),
    provideAuth0({
      domain: 'dev-nduro5lf8x5ddjgj.eu.auth0.com',
      clientId: 'f5We2HLhj4JInznJZHZYY6eXDz6I3AEz',
    }),
    {
      provide: ENVIRONMENT,
      useValue: environment
    }
  ]
})  .catch(err => console.error(err));
