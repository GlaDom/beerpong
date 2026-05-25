import { Component, inject, Input, OnInit } from '@angular/core';
import { Match } from '../../../api/match.interface';
import { GameCardComponent } from '../../game-card/game-card.component';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { Team } from '../../../api/team.interface';
import { RankingComponent } from '../../ranking/ranking.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfigurationService } from '../../../services/configuration.service';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import Group from '../../../api/group.interface';
import { BeerpongStore } from '../../../store/beerpong/beerpong.store';

@Component({
    selector: 'app-mode-o-gf-t',
    imports: [
        GameCardComponent,
        Tabs, TabList, Tab, TabPanels, TabPanel,
        ButtonModule,
        FieldsetModule,
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
  private beerpongStore = inject(BeerpongStore);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private configService = inject(ConfigurationService);

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

  ngOnInit(): void {
    this.gameId = this.regularMatches[0]?.tournament_id;
  }

  updateFinal(): void {
    if (this.gameId) this.beerpongStore.updateFinal(this.gameId, this.gameMode);
  }

  getRanking(): Team[] {
    let allTeams: Team[] = [];
    let rankedTeams: Team[] = [];

    // Alle Teams aus den Gruppen sammeln
    this.groups.forEach(group => {
        allTeams.push(...group.teams);
    });

    // Prüfen, ob Spiele in den verschiedenen Turnierphasen gespielt wurden
    const finalsPlayed = this.finalMatches.some(match => match.points_home > 0 || match.points_away > 0);

    // Wenn Spiele gespielt wurden, sortiere die Teams entsprechend der Turnierphase
    const eliminatedTeams = allTeams.filter(team => 
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

    // Rangliste zusammenstellen
    rankedTeams = [
        ...finalWinners, // Platz 1
        ...finalLosers,  // Platz 2
        ...sortedEliminatedTeams // Platz 3-5
    ];
    

    return rankedTeams;
  }

  backToAdminSpace(): void {
    this.beerpongStore.setShowRanking(false);
  }

  confirmGameFinish(event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Bist du sicher dass du das Spiel beenden willst?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.messageService.add({ severity: 'info', summary: 'Bestaetigt', detail: 'Spiel wird beendet' });
        if (this.gameId) this.beerpongStore.finishGame(this.gameId);
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'Spiel nicht beendet', life: 3000 });
      }
    });
  }

  setTournamentFinished(): void {
    this.beerpongStore.setShowRanking(true);
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

