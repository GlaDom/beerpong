import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { MenubarModule } from 'primeng/menubar';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { BeerpongState } from './store/beerpong/game.state';
import { Store } from '@ngrx/store';
import { loadGame } from './store/beerpong/beerpong.actions';
import { TabMenuModule } from 'primeng/tabmenu';
import { CommonModule, NgIf } from '@angular/common';
import { UserState } from './store/user/user.state';
import { selectUserState } from './store/user/user.selectors';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { AuthService } from './services/auth/auth.service';
import { DrawerModule } from 'primeng/drawer';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';

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
    RouterModule,
    DrawerModule,
    ToggleSwitchModule,
    FormsModule
]
})
export class AppComponent implements OnInit {
  public emptyUrlPath = true;
  public tieredItems: MenuItem[] | undefined = []; 
  public items: MenuItem[] | undefined = [];
  public title = 'SKBeerpong';
  public avatarUrl: string = '../assets/default-avatar.jpg';
  public user$: Observable<UserState> | undefined;
  public isLoggedIn: boolean = false;
  public showDrawer = false;
  public darkModeChecked = true;


  constructor(
    private beerpongStore: Store<BeerpongState>,
    private userStore: Store<UserState>,
    private authService: AuthService,
    private router: Router,
  ) {
    this.user$ = this.userStore.select(selectUserState)
    if (this.router.url === '/' || this.router.url === '') {
      this.emptyUrlPath = true;
    }
  }

  ngOnInit(): void {
    console.log('app component hit');
    this.user$?.subscribe((user) => {
      if(user.userDetails) {
        this.avatarUrl = user.userDetails.picture!;
      }
      if(user.isLoggedIn) {
        this.isLoggedIn = user.isLoggedIn
      }
    })
    this.tieredItems = [
      {label: "Logout", icon: "pi pi-sign-out", command: () => this.authService.logout()}
    ]
  }

  public toggleDrawer(): void {
    this.showDrawer = !this.showDrawer
  }

  public toggleDarkMode() {
    const element = document.querySelector('html');
    console.log(element)
    element!.classList.toggle('my-app-dark');
  }
}
