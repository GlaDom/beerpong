import { Component, Signal } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { BeerpongState } from '../../store/beerpong/game.state';
import { Store } from '@ngrx/store';
import { finishGame, loadGame, loadLastGame } from '../../store/beerpong/beerpong.actions';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { async, Observable } from 'rxjs';
import Game from '../../api/game.interface';
import { selectLastGame } from '../../store/beerpong/beerpong.selectors';
import { RankingComponent } from "../../components/ranking/ranking.component";
import { GameState } from '../../models/game-state.model';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { Router, RouterLink } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import Team from '../../api/team.interface';
import { ConfigurationService } from '../../services/configuration.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    standalone: true,
    imports: [PanelModule, CardModule, ButtonModule, RankingComponent, CommonModule, TagModule, RouterLink, ConfirmDialogModule],
    providers: [ConfirmationService, MessageService, ConfigurationService]
})
export class HomeComponent {
  // public Variables
  public lastGame$: Observable<GameState>;
  public test: any;

  public lastGame: GameState;
  public sortedTeams: Team[] = [];

  constructor(private beerpongStore: Store<BeerpongState>, 
    private confirmationService: ConfirmationService, 
    private messageService: MessageService, 
    private router: Router,
    private configService: ConfigurationService) {
    this.lastGame$ = this.beerpongStore.select(selectLastGame);
  }
  
  ngOnInit(): void {
    this.beerpongStore.dispatch(loadLastGame())
    this.lastGame$.subscribe((game: GameState) => {
      if (game.game.user_sub !== '') {
        this.lastGame = game;
        if (game && game.game && game.game.teams.length > 0) {
          this.sortedTeams = Array.from(game.game.teams);
          this.sortedTeams = this.configService.sortTeamsByPointsAndCupDifference(this.sortedTeams);
        }
        console.log('Last game loaded:', game);
      }
    });
  }

  public getGameMode(mode: number): string {
    switch (mode) {
      case 0:
        return '6 Gruppen je 5 Teams';
      case 1:
        return '1 Gruppe je 5 Teams';
      default:
        return 'Unknown Mode';
    }
  }

  public newGame(path: string): void {
    // This method can be used to navigate to different routes if needed
    // For example, you can use the Angular Router to navigate
    // this.router.navigate([path]);
    if (this.lastGame && !this.lastGame.game.is_finished) {
      this.confirmationService.confirm({
            message: 'Ein Spiel ist noch aktiv. Möchtest du das aktuelle Spiel beenden und ein neues Spiel starten?',
            header: 'Achtung',
            closable: true,
            closeOnEscape: true,
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: {
                label: 'Abbrechen',
                severity: 'secondary',
                outlined: true,
            },
            acceptButtonProps: {
                label: 'Ja',
            },
            accept: () => {
                this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Aktuelles Spiel wird beendet' });
                this.beerpongStore.dispatch(finishGame({ gameId: this.lastGame.game.id! }));
                this.router.navigate([path]);
            },
            reject: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Rejected',
                    detail: 'You have rejected',
                    life: 3000,
                });
            },
        });
    } else {
      this.router.navigate([path]);
    }
  }

  public continueGame(): string {
    if (this.lastGame && !this.lastGame.game.is_finished) {
      return '';
    } else {
      return 'text-gray-500'
    }
  }
}

