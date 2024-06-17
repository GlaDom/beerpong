import { Component, OnInit } from '@angular/core';
import { GameCardComponent } from '../../components/game-card/game-card.component';
import { ConfigurationService } from '../../services/configuration.service';
import Match from '../../api/match.interface';
import { NgFor, NgIf } from '@angular/common';
import { Store } from '@ngrx/store';
import { BeerpongGame, Status } from '../../store/game.state';
import { selectGame } from '../../store/beerpong.selectors';
import { TabViewModule } from 'primeng/tabview';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { FieldsetModule } from 'primeng/fieldset';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { finishGame } from '../../store/beerpong.actions';
import { BeerpongSetupComponent } from '../../components/beerpong-setup/beerpong-setup.component';

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

    //$game: Observable<BeerpongGame>
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
      private beerpongStore: Store<BeerpongGame>,
      private messageService: MessageService,
    ) {}

    ngOnInit(): void {
      this.beerpongStore.select(selectGame).subscribe((game: any) => {
        if(game.beerpong.matches.length>0) {
          console.log(game.beerpong.groups[0].teams[0].game_id)
          this.gameId = game.beerpong.groups[0].teams[0].game_id
          this.matches = game.beerpong.matches
          this.sortedMatches = this.configService.sortMatches(this.matches)
          this.roundOfsixteen = this.configService.filterMatches('round_of_16', this.matches)
          this.quaterFinalMatches = this.configService.filterMatches('quaterfinal', this.matches)
          this.semiFinalMatches = this.configService.filterMatches('semifinal', this.matches)
          this.finalMatch = this.configService.filterMatches('final', this.matches)
          
          if(game.beerpong.toastStatus==='success') {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Match successfully updated!' })
          } else if(game.beerpong.toastStatus==='failed') {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update Match!' })
          }
        }
        this.loading = false
      })
    }

    finishTournament(): void {
      console.log(this.gameId)
      if(this.gameId) {
        this.beerpongStore.dispatch(finishGame({gameId: this.gameId}))
      }
    }
}
