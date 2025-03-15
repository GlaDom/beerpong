import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminSpaceComponent } from './app/pages/admin-space/admin-space.component';
import { GameplanComponent } from './app/pages/gameplan/gameplan.component';
import { BeerpongSetupComponent } from './app/components/beerpong-setup/beerpong-setup.component';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideEffects } from '@ngrx/effects';
import { StoreModule, provideState, provideStore } from '@ngrx/store';
import { beerpongReducer } from './app/store/beerpong.reducer';
import { BeerpongEffects } from './app/store/beerpong.effetcs';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideRouterStore } from '@ngrx/router-store';
import { HomeComponent } from './app/pages/home/home.component';
import { authHttpInterceptorFn, provideAuth0 } from '@auth0/auth0-angular';
import { AuthGuardService } from './app/services/auth/auth-guard.service';
import { CallbackComponent } from './app/pages/oauth/callback/callback.component';
import { ENVIRONMENT } from './app/services/env/environment.service';
import { environment } from './environments/environment';

const routes: Routes = [
  {
    path: "home", component: HomeComponent, canActivate: [AuthGuardService]
  },
  {
    path: "adminspace", component: AdminSpaceComponent
  },
  {
    path: "gameconfiguration", component: BeerpongSetupComponent
  },
  {
    path: "gameplan", component: GameplanComponent
  },
  {
    path: 'callback', component: CallbackComponent
  },
  {
    path: "", redirectTo: "/home", pathMatch: "full"
  }
];

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserAnimationsModule),
    importProvidersFrom(BrowserModule),
    importProvidersFrom(RouterModule.forRoot(routes)),
    importProvidersFrom(HttpClientModule),
    provideAnimations(),
    provideEffects(BeerpongEffects),
    provideStore(),
    provideState({ name: 'beerpongState', reducer: beerpongReducer}),
    provideRouterStore(),
    provideStoreDevtools({
        maxAge: 25, // Retains last 25 states
        trace: false, //  If set to true, will include stack trace for every dispatched action, so you can see it in trace tab jumping directly to that part of code
        traceLimit: 75, // maximum stack trace frames to be stored (in case trace option was provided as true)
        connectInZone: true, // If set to true, the connection is established within the Angular zone
        logOnly: false
    }),
    provideHttpClient(withInterceptors([authHttpInterceptorFn])),
    provideAuth0({
      domain: 'dev-nduro5lf8x5ddjgj.eu.auth0.com',
      clientId: 'f5We2HLhj4JInznJZHZYY6eXDz6I3AEz',
      authorizationParams: {
        audience: 'https://dev-nduro5lf8x5ddjgj.eu.auth0.com/api/v2/',
        redirect_uri: 'http://localhost:4200/callback'
      }
    }),
    {
      provide: ENVIRONMENT,
      useValue: environment
    }
  ]
})  .catch(err => console.error(err));
