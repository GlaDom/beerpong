import { Component, OnInit } from '@angular/core';
import { GameCardComponent } from '../../components/game-card/game-card.component';
import { ConfigurationService } from '../../services/configuration.service';
import Match from '../../api/match.interface';
import { NgFor, NgIf } from '@angular/common';
import { Store } from '@ngrx/store';
import { BeerpongState, Status } from '../../store/game.state';
import { selectBeerpongState, selectGame } from '../../store/beerpong.selectors';
import { TabViewModule } from 'primeng/tabview';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { FieldsetModule } from 'primeng/fieldset';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { finishGame, updateMatchesFinal, updateMatchesQuaterFinals, updateMatchesRoundOfSixteen, updateMatchesSemiFinals } from '../../store/beerpong.actions';
import { BeerpongSetupComponent } from '../../components/beerpong-setup/beerpong-setup.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-game-plan',
  standalone: true,
  imports: [
    GameCardComponent,
    NgIf,
    NgFor,
    TabViewModule,
    ButtonModule,
    PanelModule,
    FieldsetModule,
    ToastModule,
    BeerpongSetupComponent
  ],
  providers: [
    MessageService
  ],
  templateUrl: './admin-space.component.html',
  styleUrl: './admin-space.component.css'
})
export class AdminSpaceComponent implements OnInit {

    game$: Observable<BeerpongState>
    gameId: number | undefined;
    matches: Match[] = [];
    sortedMatches: Match[][] = [];
    roundOfsixteen: Match[] = [];
    quaterFinalMatches: Match[] = [];
    semiFinalMatches: Match[] = [];
    finalMatch: Match[] = [] ;
    loading: boolean = true;

    constructor(
      private configService: ConfigurationService,
      private beerpongStore: Store<BeerpongState>,
      private messageService: MessageService,
    ) {
      this.game$ = this.beerpongStore.select(selectBeerpongState)
    }

    ngOnInit(): void {
      this.game$.subscribe((game) => {
        if(game.matches.length>0) {
          this.gameId = game.groups[0].teams[0].game_id
          this.matches = game.matches
          this.sortedMatches = this.configService.sortMatches(this.matches)
          this.roundOfsixteen = this.configService.filterMatches('round_of_16', this.matches)
          this.quaterFinalMatches = this.configService.filterMatches('quaterfinal', this.matches)
          this.semiFinalMatches = this.configService.filterMatches('semifinal', this.matches)
          this.finalMatch = this.configService.filterMatches('final', this.matches)
          
          this.checkForToastMessage(game.toastStatus)
          
        }
        this.loading = false
      })
    }

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
      if(this.gameId) {
        this.beerpongStore.dispatch(updateMatchesFinal({gameId: this.gameId}))
      }
    }

    setTournamentFinished(): void {}

    finishTournament(): void {
      console.log(this.gameId)
      if(this.gameId) {
        this.beerpongStore.dispatch(finishGame({gameId: this.gameId}))
      }
    }

    checkForToastMessage(state: any): void {
      switch(state) {
        case "success match updated": {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Match successfully updated!' })
          break
        }
        case "failed match updated": {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update Match!' })
          break
        }
        case "failed update round of 16": {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to calculate round of 16! All matches played?' })
          break
        }
        case "failed update quater finals": {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to calculate quater finals! All matches played?' })
          break;
        }
        case "failed update semi finals": {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to calculate semi finals! All matches played?' })
          break;
        }
        case "failed update final": {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to calculate final! All matches played?' })
          break;
        }
      }
    }
}
