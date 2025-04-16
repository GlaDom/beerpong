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
    let allTeams: Team[] = [];
    let rankedTeams: Team[] = [];

    // Alle Teams aus den Gruppen sammeln
    this.groups.forEach(group => {
        allTeams.push(...group.teams);
    });

    // Prüfen, ob Spiele in den verschiedenen Turnierphasen gespielt wurden
    const roundOfSixteenPlayed = this.roundOfsixteen.some(match => match.points_home > 0 || match.points_away > 0);
    const quaterFinalsPlayed = this.quaterFinalMatches.some(match => match.points_home > 0 || match.points_away > 0);
    const semiFinalsPlayed = this.semiFinalMatches.some(match => match.points_home > 0 || match.points_away > 0);
    const finalsPlayed = this.finalMatches.some(match => match.points_home > 0 || match.points_away > 0);

    if (!roundOfSixteenPlayed) {
        // Wenn keine Spiele gespielt wurden, sortiere alle Teams nach Punkten und Cup-Differenz
        rankedTeams = this.configService.sortTeamsByPointsAndCupDifference(allTeams);
    } else {
        // Wenn Spiele gespielt wurden, sortiere die Teams entsprechend der Turnierphase
        const eliminatedTeams = allTeams.filter(team => 
            !this.roundOfsixteen.some(match => match.home_team === team.team_name || match.away_team === team.team_name) &&
            !this.quaterFinalMatches.some(match => match.home_team === team.team_name || match.away_team === team.team_name) &&
            !this.semiFinalMatches.some(match => match.home_team === team.team_name || match.away_team === team.team_name) &&
            !this.finalMatches.some(match => match.home_team === team.team_name || match.away_team === team.team_name)
        );

        // Sortiere ausgeschiedene Teams
        const sortedEliminatedTeams = this.configService.sortTeamsByPointsAndCupDifference(eliminatedTeams);

        // Gewinner und Verlierer der Finalspiele bestimmen (falls gespielt)
        const finalWinners = finalsPlayed
            ? this.getTeamsByName(this.finalMatches.map(match => match.points_home > match.points_away ? match.home_team : match.away_team))
            : [];
        const finalLosers = finalsPlayed
            ? this.getTeamsByName(this.finalMatches.map(match => match.points_home > match.points_away ? match.away_team : match.home_team))
            : [];

        // Gewinner und Verlierer der Halbfinalspiele bestimmen (falls gespielt)
        const semiFinalWinners = semiFinalsPlayed
            ? this.getTeamsByName(this.semiFinalMatches.map(match => match.points_home > match.points_away ? match.home_team : match.away_team))
            : [];
        const semiFinalLosers = semiFinalsPlayed
            ? this.getTeamsByName(this.semiFinalMatches.map(match => match.points_home > match.points_away ? match.away_team : match.home_team))
            : [];

        // Gewinner und Verlierer der Viertelfinalspiele bestimmen (falls gespielt)
        const quaterFinalWinners = quaterFinalsPlayed
            ? this.getTeamsByName(this.quaterFinalMatches.map(match => match.points_home > match.points_away ? match.home_team : match.away_team))
            : [];
        const quaterFinalLosers = quaterFinalsPlayed
            ? this.getTeamsByName(this.quaterFinalMatches.map(match => match.points_home > match.points_away ? match.away_team : match.home_team))
            : [];

        // Gewinner und Verlierer der Achtelfinalspiele bestimmen (falls gespielt)
        const roundOfSixteenWinners = roundOfSixteenPlayed
            ? this.getTeamsByName(this.roundOfsixteen.map(match => match.points_home > match.points_away ? match.home_team : match.away_team))
            : [];
        const roundOfSixteenLosers = roundOfSixteenPlayed
            ? this.getTeamsByName(this.roundOfsixteen.map(match => match.points_home > match.points_away ? match.away_team : match.home_team))
            : [];

        // Rangliste zusammenstellen
        rankedTeams = [
            ...finalWinners, // Platz 1
            ...finalLosers,  // Platz 2
            ...semiFinalLosers, // Platz 3-4
            ...quaterFinalLosers, // Platz 5-8
            ...roundOfSixteenLosers, // Platz 9-16
            ...sortedEliminatedTeams // Platz 17-30
        ];
    }

    return rankedTeams;
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
