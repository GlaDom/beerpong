import { Component, Input, OnInit } from '@angular/core';
import Match from '../../../api/match.interface';
import { GameCardComponent } from '../../game-card/game-card.component';
import { TabViewModule } from 'primeng/tabview';
import { NgFor, NgIf } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { BeerpongState } from '../../../store/game.state';
import { Store } from '@ngrx/store';
import { finishGame, setShowRanking, updateMatchesFinal } from '../../../store/beerpong.actions';
import Team from '../../../api/team.interface';
import { RankingComponent } from '../../ranking/ranking.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfigurationService } from '../../../services/configuration.service';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import Group from '../../../api/group.interface';

@Component({
  selector: 'app-mode-o-gf-t',
  standalone: true,
  imports: [
    GameCardComponent,
    TabViewModule,
    NgFor,
    ButtonModule,
    FieldsetModule,
    NgIf,
    RankingComponent,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [
    MessageService,
    ConfigurationService,
    ConfirmationService
  ],
  templateUrl: './mode-o-gf-t.component.html',
  styleUrl: './mode-o-gf-t.component.css'
})
export class ModeOGfTComponent implements OnInit {
  @Input()
  gameMode: number = 2;

  @Input()
  regularMatches: Match[] = [];

  @Input()
  finalMatches: Match[] = [];

  @Input()
  showRanking: boolean = false;

  @Input()
  groups: Group[] = [];

  gameId: number | undefined;

  constructor(
    private beerpongStore: Store<BeerpongState>,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private configSerice: ConfigurationService
  ) {}

  ngOnInit(): void {
    this.gameId = this.regularMatches[0].game_id
  }

  updateFinal(): void {
    if(this.gameId) {
      this.beerpongStore.dispatch(updateMatchesFinal({gameId: this.gameId, gameMode: this.gameMode}))
    }
  }

  getRanking(): Team[] {
    let retval: Team[] = [];
    let winner: Team[] = [];
    if(this.finalMatches[0]?.points_away> this.finalMatches[0]?.points_home) {
      winner = this.getTeamsByName([this.finalMatches[0].away_team])
      retval.push(...winner)
    } else if(this.finalMatches[0]?.points_home > this.finalMatches[0]?.points_away) {
      winner = this.getTeamsByName([this.finalMatches[0].home_team])
      retval.push(...winner)
    }
    let placeTwoToFive = this.groups[0].teams?.filter(t => t.team_name !== winner[0]?.team_name)
    console.log(winner)
    console.log(placeTwoToFive)
    placeTwoToFive = this.configSerice.sortTeamsbyDifference(placeTwoToFive)
    retval.push(...placeTwoToFive.reverse())
    return retval
  }

  backToAdminSpace(): void {
    this.beerpongStore.dispatch(setShowRanking({showRanking: false}))
  }

  confirmGameFinish(event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Bist du sicher dass du das Spiel beenden willst?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon:"none",
      rejectIcon:"none",
      rejectButtonStyleClass:"p-button-text",
      accept: () => {
          this.messageService.add({ severity: 'info', summary: 'Bestaetigt', detail: 'Spiel wird beendet' });
          if(this.gameId) {
            this.beerpongStore.dispatch(finishGame({gameId: this.gameId}))
          }
      },
      reject: () => {
          this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'Spiel nicht beendet', life: 3000 });
      }
  });
  }

  setTournamentFinished(): void {
    this.beerpongStore.dispatch(setShowRanking({showRanking: true}))
  }

  getTeamsByName(teamNames: string[]): Team[] {
    let retval: Team[] = []
    teamNames.map(name => {
      this.groups.map(g => {
        g.teams.map(t => {
          if(t.team_name == name){
            retval.push(t);
          }
        })
      })
    })
    return retval
  }
}

