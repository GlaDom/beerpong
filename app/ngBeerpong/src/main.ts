import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GamePlanComponent } from './app/pages/game-plan/game-plan.component';
import { BeerpongSetupComponent } from './app/pages/beerpong-setup/beerpong-setup.component';
import { HttpClientModule } from '@angular/common/http';
import { provideEffects } from '@ngrx/effects';
import { StoreModule, provideStore } from '@ngrx/store';
import { beerpongReducer } from './app/store/beerpong.reducer';
import { BeerpongEffects } from './app/store/beerpong.effetcs';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideRouterStore } from '@ngrx/router-store';

const routes: Routes = [
  {
    path: "gameplan", component: GamePlanComponent
  },
  {
    path: "gameconfiguration", component: BeerpongSetupComponent
  }
];

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserAnimationsModule),
    importProvidersFrom(BrowserModule),
    importProvidersFrom(RouterModule.forRoot(routes)),
    importProvidersFrom(HttpClientModule),
    provideEffects(BeerpongEffects),
    provideStore({
        beerpong: beerpongReducer,
    }),
    provideRouterStore(),
    provideStoreDevtools({
        maxAge: 25, // Retains last 25 states
        trace: false, //  If set to true, will include stack trace for every dispatched action, so you can see it in trace tab jumping directly to that part of code
        traceLimit: 75, // maximum stack trace frames to be stored (in case trace option was provided as true)
        connectInZone: true, // If set to true, the connection is established within the Angular zone
        logOnly: false
    }),
  ]
})  .catch(err => console.error(err));
