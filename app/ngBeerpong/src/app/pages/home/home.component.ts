import { Component, computed, inject } from '@angular/core';
import { BeerpongStore } from '../../store/beerpong/beerpong.store';
import { UserStore } from '../../store/user/user.store';
import { Router, RouterLink } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfigurationService } from '../../services/configuration.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    standalone: true,
    imports: [ConfirmDialogModule, RouterLink, CommonModule],
    providers: [ConfirmationService, MessageService, ConfigurationService]
})
export class HomeComponent {
  private beerpongStore = inject(BeerpongStore);
  private userStore = inject(UserStore);
  private configService = inject(ConfigurationService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  protected lastGame = this.beerpongStore.lastGame;

  protected hasActiveGame = computed(() => {
    const g = this.lastGame();
    return g && !g.tournament.is_finished;
  });

  protected isFinished = computed(() => {
    const g = this.lastGame();
    return g?.tournament.is_finished ?? false;
  });

  protected userName = computed(() => {
    const u = this.userStore.userDetails();
    return u?.given_name ?? u?.name ?? u?.email ?? 'Spieler';
  });

  protected sortedTeams = computed(() => {
    const groups = this.lastGame().tournament.groups;
    if (groups.length === 0) return [];
    return this.configService.sortTeamsByPointsAndCupDifference([...groups[0].teams]);
  });

  public tips = [
    { tag: 'TIPP', icon: 'gavel', title: 'Schiedsrichter‑Liste',
      body: 'Mehrere Schiedsis? Trag sie kommagetrennt ein, SK Beerpong verteilt die Spiele automatisch.' },
    { tag: 'NEU', icon: 'qr', title: 'QR‑Code teilen',
      body: 'Premium‑Funktion — generiere einen QR‑Code für deinen Live‑Spielplan. Spieler scannen, fertig.' },
    { tag: 'GUT ZU WISSEN', icon: 'sparkles', title: '"Random Teams"',
      body: 'In der Setup‑Phase: ein Klick auf "Zufällige Namen" und SK Beerpong füllt mit Kreativnamen aus der Datenbank.' },
  ];

  constructor() {
    this.beerpongStore.loadLastGame();
  }

  public newGame(): void {
    const game = this.lastGame();
    if (game && !game.tournament.is_finished) {
      this.confirmationService.confirm({
        message: 'Ein Spiel ist noch aktiv. Möchtest du das aktuelle Spiel beenden und ein neues Spiel starten?',
        header: 'Achtung',
        closable: true,
        closeOnEscape: true,
        icon: 'pi pi-exclamation-triangle',
        rejectButtonProps: { label: 'Abbrechen', severity: 'secondary', outlined: true },
        acceptButtonProps: { label: 'Ja' },
        accept: () => {
          this.beerpongStore.finishGame(game.tournament.id!);
          this.router.navigate(['/gameconfiguration']);
        },
        reject: () => {},
      });
    } else {
      this.router.navigate(['/gameconfiguration']);
    }
  }
}
