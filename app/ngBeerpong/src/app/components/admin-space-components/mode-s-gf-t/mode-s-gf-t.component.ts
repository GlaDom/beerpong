import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FieldsetModule } from 'primeng/fieldset';
import { TabViewModule } from 'primeng/tabview';
import { GameCardComponent } from '../../game-card/game-card.component';
import { ButtonModule } from 'primeng/button';
import Match from '../../../api/match.interface';
import { Store } from '@ngrx/store';
import { BeerpongState } from '../../../store/beerpong/game.state';
import { updateMatchesRoundOfSixteen, updateMatchesQuaterFinals, updateMatchesSemiFinals, updateMatchesFinal } from '../../../store/beerpong/beerpong.actions';

@Component({
    selector: 'app-mode-s-gf-t',
    templateUrl: './mode-s-gf-t.component.html',
    styleUrl: './mode-s-gf-t.component.css',
    imports: [FieldsetModule, TabViewModule, NgIf, NgFor, GameCardComponent, ButtonModule]
})
export class ModeSGfTComponent {

  constructor(private beerpongStore:Store<BeerpongState>) {}
  
  @Input()
  gameId: number | undefined;

  @Input()
  gameMode: number = 3;

  @Input()
  sortedMatches: Match[][] = [];

  @Input()
  roundOfsixteen: Match[] = [];

  @Input()
  quaterFinalMatches: Match[] = [];

  @Input()
  semiFinalMatches: Match[] = [];

  @Input() 
  finalMatch: Match[] | undefined;


  updateRoundOfSixteen(): void {
    if(this.gameId) {
      this.beerpongStore.dispatch(updateMatchesRoundOfSixteen({gameId: this.gameId}))
    }
  }

  updateQuaterFinals(): void {
    if(this.gameId) {
      this.beerpongStore.dispatch(updateMatchesQuaterFinals({gameId: this.gameId}))
    }
  }

  updateSemiFinals(): void {
    if(this.gameId) {
      this.beerpongStore.dispatch(updateMatchesSemiFinals({gameId: this.gameId}))
    }
  }

  updateFinal(): void {
    if(this.gameId && this.gameMode) {
      this.beerpongStore.dispatch(updateMatchesFinal({gameId: this.gameId, gameMode: this.gameMode}))
    }
  }
}
