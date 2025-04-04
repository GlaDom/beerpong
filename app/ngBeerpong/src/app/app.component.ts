import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { MenubarModule } from 'primeng/menubar';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { BeerpongState } from './store/beerpong/game.state';
import { Store } from '@ngrx/store';
import { loadGame } from './store/beerpong/beerpong.actions';
import { TabMenuModule } from 'primeng/tabmenu';
import { NgIf } from '@angular/common';
import { UserState } from './store/user/user.state';
import { selectUserState } from './store/user/user.selectors';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { AuthService } from './services/auth/auth.service';
import { DrawerModule } from 'primeng/drawer';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    providers: [],
    imports: [
        AvatarModule,
        ButtonModule,
        DividerModule,
        MenubarModule,
        TieredMenuModule,
        RouterOutlet,
        TabMenuModule,
        NgIf,
        LandingPageComponent,
        RouterModule,
        DrawerModule,
    ]
})
export class AppComponent implements OnInit {
  public tieredItems: MenuItem[] | undefined = []; 
  public items: MenuItem[] | undefined = [];
  public title = 'SKBeerpong';
  public avatarUrl: string = '../assets/default-avatar.jpg';
  public user$: Observable<UserState> | undefined;
  public isLoggedIn: boolean = false;
  public showDrawer = false;


  constructor(
    private beerpongStore: Store<BeerpongState>,
    private userStore: Store<UserState>,
    private authService: AuthService,
  ) {
    this.user$ = this.userStore.select(selectUserState)
  }

  ngOnInit(): void {
    this.beerpongStore.dispatch(loadGame())
    this.user$?.subscribe((user) => {
      if(user.userDetails) {
        this.avatarUrl = user.userDetails.picture!;
      }
      if(user.isLoggedIn) {
        this.isLoggedIn = user.isLoggedIn
      }
    })
    this.items = [
      {icon: 'pi pi-bars', command: () => {this.showDrawer = !this.showDrawer}},
      // {label: "Home", icon: "pi pi-home", routerLink: "/home"},
      // {label: "Spielplan", icon: "pi pi-list", routerLink: "/gameplan"},
      // {label: "AdminBereich", icon: "pi pi-code", routerLink: "/adminspace"}
    ]
    this.tieredItems = [
      {label: "Logout", icon: "pi pi-sign-out", command: () => this.authService.logout()}
    ]
  }
}
