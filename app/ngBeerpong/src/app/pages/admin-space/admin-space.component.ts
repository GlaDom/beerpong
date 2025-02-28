import { Component, OnInit } from '@angular/core';
import { GameCardComponent } from '../../components/game-card/game-card.component';
import { ModeOGfTComponent } from '../../components/admin-space-components/mode-o-gf-t/mode-o-gf-t.component';
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
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { MessageService } from 'primeng/api';
import { finishGame, setShowRanking, updateMatchesFinal, updateMatchesQuaterFinals, updateMatchesRoundOfSixteen, updateMatchesSemiFinals } from '../../store/beerpong.actions';
import { BeerpongSetupComponent } from '../../components/beerpong-setup/beerpong-setup.component';
import { Observable } from 'rxjs';
import { RankingComponent } from '../../components/ranking/ranking.component';
import Group from '../../api/group.interface';
import Team from '../../api/team.interface';

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
    BeerpongSetupComponent,
    RankingComponent,
    ConfirmDialogModule,
    ModeOGfTComponent
  ],
  providers: [
    MessageService,
    ConfirmationService
  ],
  templateUrl: './admin-space.component.html',
  styleUrl: './admin-space.component.css'
})
export class AdminSpaceComponent implements OnInit {

    game$: Observable<BeerpongState>
    gameMode: number = 3;
    gameId: number | undefined;
    groups: Group[] = [];
    matches: Match[] = [];
    regularMatches: Match[] = [];
    sortedMatches: Match[][] = [];
    roundOfsixteen: Match[] = [];
    quaterFinalMatches: Match[] = [];
    semiFinalMatches: Match[] = [];
    finalMatch: Match[] = [];

    //booleans
    isLoading: boolean = true;
    showRanking: boolean = false;

    constructor(
      private configService: ConfigurationService,
      private beerpongStore: Store<BeerpongState>,
      private messageService: MessageService,
      private confirmationService: ConfirmationService,
    ) {
      this.game$ = this.beerpongStore.select(selectBeerpongState)
    }

    ngOnInit(): void {
      this.game$.subscribe((game) => {
        if(game.matches.length>0) {
          this.gameMode = game.game.mode
          this.gameId = game.groups[0].teams[0].game_id
          this.matches = game.matches
          this.groups = game.groups
          this.showRanking = game.showRanking
          this.regularMatches = this.configService.filterMatches('regular', this.matches)
          this.sortedMatches = this.configService.sortMatches(this.matches)
          this.roundOfsixteen = this.configService.filterMatches('round_of_16', this.matches)
          this.quaterFinalMatches = this.configService.filterMatches('quaterfinal', this.matches)
          this.semiFinalMatches = this.configService.filterMatches('semifinal', this.matches)
          this.finalMatch = this.configService.filterMatches('final', this.matches)
          
          this.checkForToastMessage(game.toastStatus)
        } else {
          this.matches = game.matches
          this.groups = game.groups
          this.showRanking = game.showRanking
        }
        this.isLoading = game.isLoading
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
      if(this.gameId && this.gameMode) {
        this.beerpongStore.dispatch(updateMatchesFinal({gameId: this.gameId, gameMode: this.gameMode}))
      }
    }

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
        case "success game finished": {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Game successfully finished!' })
          break;
        }
        case "failed game finished": {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to finish game!' })
          break;
        }
      }
    }

    getBestEightTeams(): Team[] {
      let retval: Team[] = [];
      //get place from 5 to 8
      let placeFiveToEigth: string[] = this.configService.getWinnersOfMatches(this.quaterFinalMatches);
      let teamsPlaceFiveToEigth: Team[] = this.getTeamsByName(placeFiveToEigth)
      retval.push(...this.configService.sortTeamsbyDifference(teamsPlaceFiveToEigth))
      
      //get place 3 and 4
      let placeThreeToFour: string[] = this.configService.getWinnersOfMatches(this.semiFinalMatches);
      let teamsPlaceThreeToFour: Team[] = this.getTeamsByName(placeThreeToFour)
      retval.push(...this.configService.sortTeamsbyDifference(teamsPlaceThreeToFour))

      //get place 1 and 2 
      let placeOneAndTwo: string[] = [];
      let winner: string = '';
      let second: string = '';
      if(this.finalMatch[0].points_away > this.finalMatch[0].points_home) {
        winner = this.finalMatch[0].away_team
        second = this.finalMatch[0].home_team
      } else if(this.finalMatch[0].points_home > this.finalMatch[0].points_away) {
        winner = this.finalMatch[0].home_team
        second = this.finalMatch[0].away_team
      }
      placeOneAndTwo.push(second)
      placeOneAndTwo.push(winner)
      let teamsPlaceOneToTwo: Team[] = this.getTeamsByName(placeOneAndTwo)
      retval.push(...teamsPlaceOneToTwo)

      return retval.reverse()
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
}
