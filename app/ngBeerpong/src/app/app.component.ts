import { Component, OnInit } from '@angular/core';
import { BeerpongSetupComponent } from './pages/beerpong-setup/beerpong-setup.component'
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { StepsModule } from 'primeng/steps'
import { DividerModule } from 'primeng/divider';
import { RouterOutlet } from '@angular/router';
import { ConfigurationService } from './services/configuration.service';
import { Observable } from 'rxjs';
import { BeerpongGame } from './store/game.state';
import Match from './api/match.interface';
import { Store } from '@ngrx/store';
import { loadGame } from './store/beerpong.actions';
import { selectGame } from './store/beerpong.selectors';

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
    RouterOutlet
  ]
})
export class AppComponent implements OnInit {
  title = 'SKBeerpong';
  game$: Observable<BeerpongGame>;

  constructor(
    private configService: ConfigurationService,
    private beerpongStore: Store<BeerpongGame>
  ) {
    this.game$ = new Observable<BeerpongGame>();
  }

  ngOnInit(): void {
    this.beerpongStore.dispatch(loadGame())
    this.game$ = this.beerpongStore.select(selectGame)
    let games = this.game$.subscribe(game => {
      console.log(game)
    })
  }
}
