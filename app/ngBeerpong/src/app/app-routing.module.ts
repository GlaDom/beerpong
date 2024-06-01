import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GamePlanComponent } from './pages/game-plan/game-plan.component';
import { BeerpongSetupComponent } from './pages/beerpong-setup/beerpong-setup.component';

const routes: Routes = [
  {
    path: "gameplan", component: GamePlanComponent
  },
  {
    path: "gameconfiguration", component: BeerpongSetupComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
