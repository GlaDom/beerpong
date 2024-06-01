import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GamePlanComponent } from './app/pages/game-plan/game-plan.component';
import { BeerpongSetupComponent } from './app/pages/beerpong-setup/beerpong-setup.component';

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
    importProvidersFrom(RouterModule.forRoot(routes))
  ]
})  .catch(err => console.error(err));
