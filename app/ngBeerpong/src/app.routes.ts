import { Routes } from "@angular/router";
import { BeerpongSetupComponent } from "./app/components/beerpong-setup/beerpong-setup.component";
import { AdminSpaceComponent } from "./app/pages/admin-space/admin-space.component";
import { GameplanComponent } from "./app/pages/gameplan/gameplan.component";
import { HomeComponent } from "./app/pages/home/home.component";
import { CallbackComponent } from "./app/pages/oauth/callback/callback.component";
import { AuthGuardService } from "./app/services/auth/auth-guard.service";

export const routes: Routes = [
    {
      path: "home", component: HomeComponent, canActivate: [AuthGuardService]
    },
    {
      path: "adminspace", component: AdminSpaceComponent, canActivate: [AuthGuardService]
    },
    {
      path: "gameconfiguration", component: BeerpongSetupComponent, canActivate: [AuthGuardService]
    },
    {
      path: "gameplan", component: GameplanComponent, canActivate: [AuthGuardService]
    },
    {
      path: 'callback', component: CallbackComponent
    },
  ];