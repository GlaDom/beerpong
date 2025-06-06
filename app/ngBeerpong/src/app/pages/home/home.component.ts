import { Component, Signal } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { BeerpongState } from '../../store/beerpong/game.state';
import { Store } from '@ngrx/store';
import { loadGame, loadLastGame } from '../../store/beerpong/beerpong.actions';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { async, Observable } from 'rxjs';
import Game from '../../api/game.interface';
import { selectLastGame } from '../../store/beerpong/beerpong.selectors';
import { RankingComponent } from "../../components/ranking/ranking.component";
import { GameState } from '../../models/game-state.model';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    standalone: true,
    imports: [PanelModule, CardModule, ButtonModule, RankingComponent, CommonModule]
})
export class HomeComponent {
  // public Variables
  public lastGame$: Observable<GameState>;
  public test: any;

  public lastGame: GameState;

  constructor(private beerpongStore: Store<BeerpongState>) {
    this.lastGame$ = this.beerpongStore.select(selectLastGame);
  }
  
  ngOnInit(): void {
    this.beerpongStore.dispatch(loadLastGame())
    this.lastGame$.subscribe((game: GameState) => {
      this.lastGame = game;
      console.log('Last game loaded:', game);
    });
  }
}

