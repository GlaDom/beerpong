import { Component, computed, inject } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AuthService } from './services/auth/auth.service';
import { UserStore } from './store/user/user.store';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [RouterOutlet, RouterModule]
})
export class AppComponent {
  protected userStore = inject(UserStore);
  protected isLoggedIn = this.userStore.isLoggedIn;
  protected darkModeOn = true;

  protected userName = computed(() => {
    const u = this.userStore.userDetails();
    return u?.name ?? u?.email ?? 'Spieler';
  });

  protected userInitials = computed(() => {
    const name = this.userName();
    return name.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();
  });

  constructor(private authService: AuthService) {
    document.documentElement.classList.add('my-app-dark');
  }

  public toggleDarkMode(): void {
    this.darkModeOn = !this.darkModeOn;
    document.documentElement.classList.toggle('my-app-dark');
  }

  public logout(): void {
    this.authService.logout();
  }
}
