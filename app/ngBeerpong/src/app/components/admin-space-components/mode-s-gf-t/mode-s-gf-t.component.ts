import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FieldsetModule } from 'primeng/fieldset';
import { TabViewModule } from 'primeng/tabview';
import { GameCardComponent } from '../../game-card/game-card.component';
import { ButtonModule } from 'primeng/button';
import Match from '../../../api/match.interface';
import { Store } from '@ngrx/store';
import { BeerpongState } from '../../../store/beerpong/game.state';
import { updateMatchesRoundOfSixteen, updateMatchesQuaterFinals, updateMatchesSemiFinals, updateMatchesFinal, finishGame, setShowRanking } from '../../../store/beerpong/beerpong.actions';
import Team from '../../../api/team.interface';
import Group from '../../../api/group.interface';
import { ConfigurationService } from '../../../services/configuration.service';
import { RankingComponent } from '../../ranking/ranking.component';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
    selector: 'app-mode-s-gf-t',
    templateUrl: './mode-s-gf-t.component.html',
    styleUrl: './mode-s-gf-t.component.css',
    imports: [FieldsetModule, TabViewModule, NgFor, GameCardComponent, ButtonModule, NgIf, RankingComponent]
})
export class ModeSGfTComponent {

  constructor(
    private beerpongStore:Store<BeerpongState>,
    private configService: ConfigurationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  @Input()
  showRanking: boolean = false;

  @Input()
  groups: Group[] = [];
  
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
  finalMatches: Match[] = [];


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

  getRanking(): Team[] {
    let retval: Team[] = [];
    let winner: Team[] = [];
    // alle teams aus den gruppen in ein array und dann sortieren
    let allTeams: Team[] = [];
    this.groups.map((g) => {allTeams.push(...g.teams)})
    retval = this.configService.sortTeamsByPointsAndCupDifference(allTeams);
    // if(this.finalMatches[0]?.points_away> this.finalMatches[0]?.points_home) {
    //   winner = this.getTeamsByName([this.finalMatches[0].away_team])
    //   retval.push(...winner)
    // } else if(this.finalMatches[0]?.points_home > this.finalMatches[0]?.points_away) {
    //   winner = this.getTeamsByName([this.finalMatches[0].home_team])
    //   retval.push(...winner)
    // }
    // let placeTwoToFive = this.groups[0].teams?.filter(t => t.team_name !== winner[0]?.team_name)
    // console.log(winner)
    // console.log(placeTwoToFive)
    // placeTwoToFive = this.configService.sortTeamsbyDifference(placeTwoToFive)
    // retval.push(...placeTwoToFive.reverse())
    return retval
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
    window.scrollTo(0,0)
    this.beerpongStore.dispatch(setShowRanking({showRanking: true}))
  }
}
