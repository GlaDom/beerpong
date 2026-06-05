import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ConfigurationService } from '../../services/configuration.service';
import { BeerpongStore } from '../../store/beerpong/beerpong.store';
import { GameModes } from '../../api/game-modes.enum';
import { Match } from '../../api/match.interface';
import { Team } from '../../api/team.interface';

@Component({
  selector: 'app-gameplan',
  imports: [DatePipe],
  templateUrl: './gameplan.component.html',
  styleUrl: './gameplan.component.css'
})
export class GameplanComponent {
  protected readonly GameModes = GameModes;
  private beerpongStore = inject(BeerpongStore);
  private configService = inject(ConfigurationService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  public view = signal<'grid' | 'table'>('grid');
  public lastUpdateTime = signal<Date>(new Date());
  public isLoading = this.beerpongStore.isLoading;
  public isFinished = this.beerpongStore.isFinished;
  public tournamentMode = this.beerpongStore.tournamentMode;
  public isLeagueMode = computed(() => this.tournamentMode() === GameModes.LEAGUE);

  public groups = computed(() => this.configService.sortTeamsInGroups(this.beerpongStore.groups()));
  public regularMatches = computed(() => this.configService.sortMatches(this.beerpongStore.matches()));
  public roundOfsixteen = computed(() => this.configService.filterMatches('round_of_16', this.beerpongStore.matches()));
  public quaterFinals = computed(() => this.configService.filterMatches('quaterFinal', this.beerpongStore.matches()));
  public semiFinals = computed(() => this.configService.filterMatches('semiFinal', this.beerpongStore.matches()));
  public final = computed(() => this.configService.filterMatches('final', this.beerpongStore.matches()));
  public numberOfQualifiedTeams = computed(() => this.beerpongStore.currentGame().tournament.number_of_qualified_teams);
  public thirdPlace = computed(() => this.configService.filterMatches('Spiel um Platz 3', this.beerpongStore.matches()));
  public leagueTableRows = computed(() => {
    const teams = this.groups()[0]?.teams ?? [];
    const finishedMatches = this.beerpongStore.matches().filter(m => m.type === 'regular' && this.isLocked(m));

    return teams.map((team, index) => {
      const playedMatches = finishedMatches.filter(match =>
        match.home_team === team.team_name || match.away_team === team.team_name
      );
      const wins = playedMatches.filter(match =>
        (match.home_team === team.team_name && match.points_home > match.points_away) ||
        (match.away_team === team.team_name && match.points_away > match.points_home)
      ).length;

      return {
        ...team,
        rank: index + 1,
        played: playedMatches.length,
        wins,
        losses: playedMatches.length - wins,
      };
    });
  });
  public leagueMatches = computed(() =>
    [...this.beerpongStore.matches()]
      .filter(match => match.type === 'regular')
      .sort((left, right) => {
        const leftTime = left.start_time ? new Date(left.start_time).getTime() : 0;
        const rightTime = right.start_time ? new Date(right.start_time).getTime() : 0;
        if (leftTime !== rightTime) {
          return leftTime - rightTime;
        }
        return (left.match_id ?? 0) - (right.match_id ?? 0);
      })
  );
  public playedRegularMatchCount = computed(() =>
    this.leagueMatches().filter(match => this.isLocked(match)).length
  );
  public openRegularMatchCount = computed(() =>
    Math.max(0, this.leagueMatches().length - this.playedRegularMatchCount())
  );
  public liveRegularMatchCount = computed(() => {
    const now = Date.now();
    return this.leagueMatches().filter(match => {
      if (this.isLocked(match) || !match.start_time) {
        return false;
      }
      const start = new Date(match.start_time).getTime();
      const end = match.end_time ? new Date(match.end_time).getTime() : start;
      return start <= now && end >= now;
    }).length;
  });
  public primaryViewLabel = computed(() => this.isLeagueMode() ? 'Liga-Board' : 'Match-Grid');
  public regularPhaseLabel = computed(() => this.isLeagueMode() ? 'Liga-Phase' : 'Gruppenphase');
  public regularPhaseTitle = computed(() => this.isLeagueMode() ? 'Liga-Tabelle' : 'Gruppenphase');

  public hasActiveGame = computed(() => this.groups().length > 0);
  public totalTeamCount = computed(() =>
    this.groups().reduce((sum, group) => sum + group.teams.length, 0)
  );

  public groupMatchCount = computed(() =>
    this.beerpongStore.matches().filter(m => m.type === 'regular').length
  );

  public lockedMatchCount = computed(() =>
    this.beerpongStore.matches().filter(m => this.isLocked(m)).length
  );

  public totalCups = computed(() =>
    this.beerpongStore.matches()
      .filter(m => this.isLocked(m))
      .reduce((s, m) => s + m.points_home + m.points_away, 0)
  );

  public currentPhase = computed(() => {
    const phases = [
      { matches: this.beerpongStore.matches().filter(m => m.type === 'regular'), label: this.regularPhaseLabel() },
      { matches: this.roundOfsixteen(), label: 'Achtelfinale' },
      { matches: this.quaterFinals(), label: 'Viertelfinale' },
      { matches: this.semiFinals(), label: 'Halbfinale' },
      { matches: this.thirdPlace(), label: 'Platz 3' },
      { matches: this.final(), label: 'Finale' },
    ];
    const active = phases.find(p => p.matches.length > 0 && p.matches.some(m => !this.isLocked(m)));
    if (active) return active.label;
    const last = [...phases].reverse().find(p => p.matches.length > 0);
    return last?.label ?? this.regularPhaseLabel();
  });

  public allMatchesFlat = computed(() => {
    const all = this.beerpongStore.matches();
    const result: { match: Match; phaseLabel: string; isKO: boolean }[] = [];
    all.filter(m => m.type === 'regular')
      .sort((a, b) => (a.match_id ?? 0) - (b.match_id ?? 0))
      .forEach(m => result.push({
        match: m,
        phaseLabel: this.isLeagueMode() ? this.regularPhaseLabel() : `Gruppe ${m.group_number}`,
        isKO: false,
      }));
    const ko: [string, string][] = [
      ['round_of_16', 'Achtelfinale'],
      ['quaterFinal', 'Viertelfinale'],
      ['semiFinal', 'Halbfinale'],
      ['Spiel um Platz 3', 'Platz 3'],
      ['final', 'Finale'],
    ];
    ko.forEach(([type, label]) =>
      all.filter(m => m.type === type).forEach(m => result.push({ match: m, phaseLabel: label, isKO: true }))
    );
    return result;
  });

  public finalRanking = computed((): Array<Team & { place: number }> => {
    const allTeams = this.groups().flatMap(g => g.teams);
    const ranked: Array<Team & { place: number }> = [];
    const placed = new Set<string>();

    const fin = this.final().find(m => this.isLocked(m));
    if (fin) {
      const wName = fin.points_home >= fin.points_away ? fin.home_team : fin.away_team;
      const lName = fin.points_home >= fin.points_away ? fin.away_team : fin.home_team;
      [wName, lName].forEach((name, idx) => {
        const t = allTeams.find(t => t.team_name === name);
        if (t && !placed.has(name)) { ranked.push({ ...t, place: idx + 1 }); placed.add(name); }
      });
    }

    const third = this.thirdPlace().find(m => this.isLocked(m));
    if (third) {
      const wName = third.points_home >= third.points_away ? third.home_team : third.away_team;
      const lName = third.points_home >= third.points_away ? third.away_team : third.home_team;
      [wName, lName].forEach(name => {
        const t = allTeams.find(t => t.team_name === name);
        if (t && !placed.has(name)) { ranked.push({ ...t, place: ranked.length + 1 }); placed.add(name); }
      });
    }

    allTeams
      .filter(t => !placed.has(t.team_name))
      .sort((a, b) => b.points !== a.points ? b.points - a.points : b.cup_difference - a.cup_difference)
      .forEach(t => { ranked.push({ ...t, place: ranked.length + 1 }); placed.add(t.team_name); });

    return ranked.map((r, i) => ({ ...r, place: i + 1 }));
  });

  public podium = computed(() => this.finalRanking().slice(0, 3));

  constructor() {
    this.beerpongStore.loadGame();
    interval(30000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.beerpongStore.loadGame();
      this.lastUpdateTime.set(new Date());
    });
  }

  public isLocked(m: Match): boolean {
    return m.points_home > 0 || m.points_away > 0;
  }

  public lockedInGroup(gi: number): number {
    return (this.regularMatches()[gi] ?? []).filter(m => this.isLocked(m)).length;
  }

  public setView(v: 'grid' | 'table'): void {
    this.view.set(v);
  }

  public goHome(): void {
    this.router.navigate(['/home']);
  }

  public refreshNow(): void {
    this.beerpongStore.loadGame();
    this.lastUpdateTime.set(new Date());
  }
}
