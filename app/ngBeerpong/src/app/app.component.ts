import { Component, OnInit } from '@angular/core';
import { BeerpongSetupComponent } from './components/beerpong-setup/beerpong-setup.component'
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { StepsModule } from 'primeng/steps'
import { DividerModule } from 'primeng/divider';
import { Router, RouterOutlet } from '@angular/router';
import { ConfigurationService } from './services/configuration.service';
import { Observable, Observer } from 'rxjs';
import { BeerpongState } from './store/game.state';
import { Store } from '@ngrx/store';
import { loadGame } from './store/beerpong.actions';
import { selectGame } from './store/beerpong.selectors';
import { TabMenuModule } from 'primeng/tabmenu';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
  providers: [
  ],
  imports: [
    ButtonModule,
    DividerModule,
    BeerpongSetupComponent,
    RouterOutlet,
    TabMenuModule,
    NgIf
  ]
})
export class AppComponent implements OnInit {
  items: MenuItem[] | undefined = []
  title = 'SKBeerpong';
  game$: Observable<BeerpongState>;

  gameObserver: Observer<any> = {
    next: (game) => {
      if(game && game.beerpong.matches?.length>0) {
        console.log('game loaded')
        // this.router.navigateByUrl("/gameplan")
      }
    },
    error: function (err: any): void {
      throw new Error('Function not implemented.');
    },
    complete: function (): void {
      throw new Error('Function not implemented.');
    }
  }

  constructor(
    private configService: ConfigurationService,
    private beerpongStore: Store<BeerpongState>,
    private router: Router
  ) {
    this.game$ = new Observable<BeerpongState>();
  }

  ngOnInit(): void {
    this.beerpongStore.dispatch(loadGame())
    // this.game$ = this.beerpongStore.select(selectGame)
    this.game$.subscribe(this.gameObserver)
    this.items = [
      {label: "Home", icon: "pi pi-home", route: "/home"},
      {label: "Spielplan", icon: "pi pi-list", route: "/gameplan"},
      {label: "AdminBereich", icon: "pi pi-code", route: "/adminspace"}
    ]
  }
}
