import { Component, computed, effect, inject, signal } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ConfigurationService } from '../../services/configuration.service';
import { BeerpongStore, Status } from '../../store/beerpong/beerpong.store';
import { GameCardComponent } from '../../components/game-card/game-card.component';
import { Match } from '../../api/match.interface';

type PhaseId = 'group' | 'round_of_16' | 'quaterFinal' | 'semiFinal' | 'Spiel um Platz 3' | 'final';

interface PhaseInfo {
  id: PhaseId;
  label: string;
  short: string;
  matches: Match[];
}

@Component({
  selector: 'app-game-plan',
  imports: [ToastModule, GameCardComponent],
  providers: [MessageService],
  templateUrl: './admin-space.component.html',
  styleUrl: './admin-space.component.css'
})
export class AdminSpaceComponent {
  private beerpongStore = inject(BeerpongStore);
  private configService = inject(ConfigurationService);
  private messageService = inject(MessageService);

  public isLoading = this.beerpongStore.isLoading;
  public gameId = this.beerpongStore.gameId;
  public gameMode = this.beerpongStore.gameMode;
  public groups = computed(() => this.configService.sortTeamsInGroups(this.beerpongStore.groups()));
  public hasMatches = computed(() => this.beerpongStore.matches().length > 0);

  public sortedMatches = computed(() => this.configService.sortMatches(this.beerpongStore.matches()));
  public roundOfsixteen = computed(() => this.configService.filterMatches('round_of_16', this.beerpongStore.matches()));
  public quaterFinals = computed(() => this.configService.filterMatches('quaterFinal', this.beerpongStore.matches()));
  public semiFinals = computed(() => this.configService.filterMatches('semiFinal', this.beerpongStore.matches()));
  public thirdPlace = computed(() => this.configService.filterMatches('Spiel um Platz 3', this.beerpongStore.matches()));
  public final = computed(() => this.configService.filterMatches('final', this.beerpongStore.matches()));

  private phaseOverride = signal<PhaseId | null>(null);

  public phases = computed((): PhaseInfo[] => {
    const all: PhaseInfo[] = [
      { id: 'group',            label: 'Gruppenphase',      short: 'GR', matches: this.beerpongStore.matches().filter(m => m.type === 'regular') },
      { id: 'round_of_16',      label: 'Achtelfinale',      short: 'AF', matches: this.roundOfsixteen() },
      { id: 'quaterFinal',      label: 'Viertelfinale',     short: 'VF', matches: this.quaterFinals() },
      { id: 'semiFinal',        label: 'Halbfinale',        short: 'HF', matches: this.semiFinals() },
      { id: 'Spiel um Platz 3', label: 'Spiel um Platz 3', short: 'P3', matches: this.thirdPlace() },
      { id: 'final',            label: 'Finale',            short: 'F',  matches: this.final() },
    ];
    return all.filter(p => p.id === 'group' || p.matches.length > 0);
  });

  public activePhase = computed((): PhaseId => {
    const override = this.phaseOverride();
    if (override !== null) return override;
    const p = this.phases();
    return p.length > 0 ? p[p.length - 1].id : 'group';
  });

  public phaseProgress = computed(() => {
    const phase = this.activePhase();
    const matches = phase === 'group'
      ? this.beerpongStore.matches().filter(m => m.type === 'regular')
      : this.configService.filterMatches(phase, this.beerpongStore.matches());
    const locked = matches.filter(m => this.isLocked(m)).length;
    return { total: matches.length, locked, complete: matches.length > 0 && locked === matches.length };
  });

  public phaseCta = computed(() => {
    switch (this.activePhase()) {
      case 'group':            return 'K.O.-Phase auslosen';
      case 'round_of_16':     return 'Viertelfinale auslosen';
      case 'quaterFinal':     return 'Halbfinale auslosen';
      case 'semiFinal':       return 'Finale auslosen';
      case 'Spiel um Platz 3': return null;
      case 'final':           return 'Turnier beenden';
    }
  });

  public activeKoMatches = computed((): Match[] => {
    const phase = this.activePhase();
    if (phase === 'group') return [];
    return this.configService.filterMatches(phase, this.beerpongStore.matches());
  });

  public isFinalPhase = computed(() => this.activePhase() === 'final');
  public activePhaseLabel = computed(() =>
    this.phases().find(p => p.id === this.activePhase())?.label ?? 'Spielplan'
  );

  constructor() {
    this.beerpongStore.loadGame();
    effect(() => {
      const status = this.beerpongStore.toastStatus();
      if (!status || status === 'notset') return;
      this.showToast(status);
    });
  }

  public setPhase(id: PhaseId): void {
    this.phaseOverride.set(id);
  }

  public isLocked(m: Match): boolean {
    return m.points_home > 0 || m.points_away > 0;
  }

  public isPhaseComplete(phase: PhaseInfo): boolean {
    return phase.matches.length > 0 && phase.matches.filter(m => this.isLocked(m)).length === phase.matches.length;
  }

  public lockedCount(phase: PhaseInfo): number {
    return phase.matches.filter(m => this.isLocked(m)).length;
  }

  public lockedInGroup(gi: number): number {
    return (this.sortedMatches()[gi] ?? []).filter(m => this.isLocked(m)).length;
  }

  public advancePhase(): void {
    const id = this.gameId();
    const mode = this.gameMode();
    if (!id) return;
    switch (this.activePhase()) {
      case 'group':           this.beerpongStore.updateRoundOfSixteen(id); break;
      case 'round_of_16':    this.beerpongStore.updateQuaterFinals(id); break;
      case 'quaterFinal':    this.beerpongStore.updateSemiFinals(id); break;
      case 'semiFinal':      if (mode) this.beerpongStore.updateFinal(id, mode); break;
      case 'final':          this.beerpongStore.finishGame(id); break;
    }
  }

  private showToast(status: Status): void {
    const map: Partial<Record<NonNullable<Status>, [string, string]>> = {
      'success match updated':       ['success', 'Ergebnis gespeichert!'],
      'failed match updated':        ['error',   'Fehler beim Speichern!'],
      'failed update round of 16':   ['error',   'Achtelfinale konnte nicht ausgelost werden. Alle Spiele eingetragen?'],
      'failed update quater finals': ['error',   'Viertelfinale konnte nicht ausgelost werden. Alle Spiele eingetragen?'],
      'failed update semi finals':   ['error',   'Halbfinale konnte nicht ausgelost werden. Alle Spiele eingetragen?'],
      'failed update final':         ['error',   'Finale konnte nicht ausgelost werden. Alle Spiele eingetragen?'],
      'success game finished':       ['success', 'Turnier erfolgreich beendet!'],
      'failed game finished':        ['error',   'Fehler beim Beenden des Turniers!'],
      'invalid match result':        ['error',   'Ungültiges Ergebnis eingegeben!'],
    };
    const entry = map[status!];
    if (entry) {
      this.messageService.add({
        severity: entry[0],
        summary: entry[0] === 'error' ? 'Fehler' : 'Erfolg',
        detail: entry[1],
        life: 4000,
      });
    }
  }
}
