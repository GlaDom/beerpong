import { Component, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DatePicker } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputTextModule } from 'primeng/inputtext';
import { GameModes } from '../../api/game-modes.enum';
import { Team } from '../../api/team.interface';
import { DemoTeams } from './demo-teams';
import { BeerpongStore } from '../../store/beerpong/beerpong.store';
import { UserStore } from '../../store/user/user.store';
import { Referee } from '../../api/referee';
import { uniqueTeamNamesValidator } from '../../shared/validators/duplicate-team-names-validator';
import { NewTournament } from '../../api/game-request';
import Group from '../../api/group.interface';

@Component({
  selector: 'app-beerpong-setup',
  templateUrl: './beerpong-setup.component.html',
  styleUrl: './beerpong-setup.component.css',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    DatePicker,
    ToggleSwitchModule,
    InputTextModule,
  ]
})
export class BeerpongSetupComponent {
  protected readonly GameModes = GameModes;
  private userStore = inject(UserStore);
  private beerpongStore = inject(BeerpongStore);
  private router = inject(Router);

  public currentStep = signal(0);
  public currentMode = signal<GameModes>(GameModes.GROUP);
  public currentGroupCount = signal(1);
  public currentTeamCount = signal(3);

  public readonly steps = [
    { label: 'Spieleinstellungen' },
    { label: 'Mannschaften' },
    { label: 'Übersicht' },
  ];

  public readonly modeOptions = [
    {
      value: GameModes.GROUP,
      title: 'Gruppen-Modus',
      description: 'Mehrere Gruppen + K.O.-Phase',
    },
    {
      value: GameModes.LEAGUE,
      title: 'Liga-Modus',
      description: 'Eine Tabelle, jeder gegen jeden',
    },
  ];

  public readonly groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  public gameForm: FormGroup;
  private groupsStatus = signal<string>('INVALID');
  public isLeagueMode = computed(() => this.currentMode() === GameModes.LEAGUE);
  public totalTeamCount = computed(() =>
    this.isLeagueMode() ? this.currentTeamCount() : this.currentGroupCount() * this.currentTeamCount()
  );

  public canAdvance = computed(() => {
    if (this.currentStep() === 0) {
      const g = this.currentGroupCount();
      const t = this.currentTeamCount();
      return g >= 1 && t >= 3 && g <= this.maxGroups() && t <= this.maxTeamsPerGroup();
    }
    if (this.currentStep() === 1) {
      return this.groupsStatus() === 'VALID';
    }
    return true;
  });

  constructor(private fb: FormBuilder) {
    this.gameForm = this.fb.group({
      mode: this.fb.control<GameModes>(GameModes.GROUP, [Validators.required]),
      amountOfGroups: this.fb.control<number | null>(1, [Validators.required]),
      amountOfTeams: this.fb.control<number | null>(3, [Validators.required]),
      groups: this.fb.array([
        this.fb.group({
          groupName: this.fb.control<string | null>('A', [Validators.required]),
          teams: this.fb.array([
            new FormControl<string | null>(null, [Validators.required]),
            new FormControl<string | null>(null, [Validators.required]),
            new FormControl<string | null>(null, [Validators.required]),
          ])
        })
      ], uniqueTeamNamesValidator()),
      gameTime: this.fb.control<number | null>(12, [Validators.required]),
      gameStart: this.fb.control<Date | null>(null),
      koStage: this.fb.control<boolean>(false),
      includeThirdPlaceMatch: this.fb.control<boolean>(false),
      numberOfQualifiedTeams: this.fb.control<number | null>(1, [Validators.required]),
      withReferees: this.fb.control<boolean>(false),
      referees: this.fb.control<string | null>(null),
    });

    this.gameForm.controls['groups'].statusChanges.subscribe(status => {
      this.groupsStatus.set(status);
    });

    this.gameForm.controls['koStage'].valueChanges.subscribe(enabled => {
      if (!enabled) {
        this.gameForm.controls['numberOfQualifiedTeams'].setValue(null);
        return;
      }
      this.normalizeQualifiedTeams(true);
    });
  }

  get groupsFormArray(): FormArray {
    return this.gameForm.controls['groups'] as FormArray;
  }

  public getTeamsFromArray(groupIndex: number): FormArray {
    return this.groupsFormArray.at(groupIndex).get('teams') as FormArray;
  }

  get amountOfGroups(): FormControl {
    return this.gameForm.controls['amountOfGroups'] as FormControl;
  }

  get amountOfTeams(): FormControl {
    return this.gameForm.controls['amountOfTeams'] as FormControl;
  }

  get gameTime(): FormControl {
    return this.gameForm.controls['gameTime'] as FormControl;
  }

  public setMode(mode: GameModes): void {
    if (this.currentMode() === mode) {
      return;
    }

    this.currentMode.set(mode);
    this.gameForm.controls['mode'].setValue(mode);

    const nextGroupCount = mode === GameModes.LEAGUE ? 1 : this.clampGroupCount(this.currentGroupCount());
    const nextTeamCount = this.clampTeamCount(this.currentTeamCount());

    this.currentGroupCount.set(nextGroupCount);
    this.currentTeamCount.set(nextTeamCount);
    this.amountOfGroups.setValue(nextGroupCount);
    this.amountOfTeams.setValue(nextTeamCount);
    this.rebuildGroups(nextGroupCount, nextTeamCount);
    this.normalizeQualifiedTeams(true);
  }

  public setGroups(n: number): void {
    const count = this.clampGroupCount(n);
    const teamsPerGroup = this.clampTeamCount(this.currentTeamCount());

    this.currentGroupCount.set(count);
    this.currentTeamCount.set(teamsPerGroup);
    this.amountOfGroups.setValue(count);
    this.amountOfTeams.setValue(teamsPerGroup);
    this.rebuildGroups(count, teamsPerGroup);
    this.normalizeQualifiedTeams(false);
  }

  public setTeamsPerGroup(n: number): void {
    const count = this.clampTeamCount(n);

    this.currentTeamCount.set(count);
    this.amountOfTeams.setValue(count);
    this.rebuildGroups(this.currentGroupCount(), count);
    this.normalizeQualifiedTeams(false);
  }

  public setGameTime(n: number): void {
    this.gameTime.setValue(Math.max(5, Math.min(30, n)));
  }

  public nextStep(): void {
    if (this.currentStep() < 2) this.currentStep.update(v => v + 1);
  }

  public prevStep(): void {
    if (this.currentStep() > 0) this.currentStep.update(v => v - 1);
  }

  public goToStep(i: number): void {
    if (i <= this.currentStep()) this.currentStep.set(i);
  }

  public fillGroupsWithTeamNames(): void {
    const pool = [...DemoTeams].sort(() => Math.random() - 0.5);
    let idx = 0;
    this.groupsFormArray.controls.forEach(groupControl => {
      const teamsArray = groupControl.get('teams') as FormArray;
      teamsArray.controls.forEach(teamControl => {
        teamControl.setValue(pool[idx++ % pool.length]);
      });
    });
  }

  public startGame(): void {
    const referees: Referee[] = [];
    const refValue: string | null = this.gameForm.get('referees')?.value;
    if (this.gameForm.get('withReferees')?.value && refValue) {
      refValue.trim().split(',').forEach(r => {
        const name = r.trim();
        if (name) referees.push({ name });
      });
    }

    const newGame: NewTournament = {
      tournament: {
        user_sub: this.userStore.userDetails().sub ?? '',
        mode: this.currentMode(),
        amount_of_teams: this.amountOfTeams.value,
        is_finished: false,
        game_time: this.gameTime.value,
        start_time: this.gameForm.get('gameStart')?.value,
        referee: referees,
        groups: this.getGroupsForNewGame(),
        got_ko_stage: this.gameForm.get('koStage')?.value,
        got_stage_in_between: this.gameForm.get('includeThirdPlaceMatch')?.value,
        number_of_qualified_teams: (this.gameForm.get('numberOfQualifiedTeams')?.value as number | null) ?? 0,
        include_third_place_match: this.gameForm.get('includeThirdPlaceMatch')?.value,
      },
    };

    this.beerpongStore.createGame(newGame);
    this.router.navigate(['/adminspace']);
  }

  private getGroupsForNewGame(): Group[] {
    return this.groupsFormArray.controls.map(groupControl => {
      const groupName = groupControl.get('groupName')?.value;
      const teamsArray = groupControl.get('teams') as FormArray;
      const teams: Team[] = teamsArray.controls.map(t => ({
        team_name: t.value || this.getRandomTeamName(),
        group_name: groupName,
        points: 0,
        cups_hit: 0,
        cups_get: 0,
        cup_difference: 0,
        rank: 0,
      }));
      return { group_name: groupName, teams };
    });
  }

  public maxGroups(): number {
    return this.isLeagueMode() ? 1 : 10;
  }

  public maxTeamsPerGroup(): number {
    return this.isLeagueMode() ? 16 : 6;
  }

  public groupCountHint(): string {
    return this.isLeagueMode() ? 'Genau eine Liga' : '1 bis 10';
  }

  public teamCountLabel(): string {
    return this.isLeagueMode() ? 'Teams in der Liga' : 'Teams pro Gruppe';
  }

  public teamCountHint(): string {
    return this.isLeagueMode() ? '3 bis 16' : '3 bis 6';
  }

  public teamSectionSummary(): string {
    if (this.isLeagueMode()) {
      return `${this.totalTeamCount()} Teams in einer Liga`;
    }
    return `${this.totalTeamCount()} Teams in ${this.currentGroupCount()} Gruppen`;
  }

  public reviewModeLabel(): string {
    return this.isLeagueMode() ? 'Liga-Modus' : 'Gruppen-Modus';
  }

  public displayGroupLabel(groupName: string | null | undefined): string {
    return this.isLeagueMode() ? 'Liga' : `Gruppe ${groupName}`;
  }

  public displayGroupBadge(groupName: string | null | undefined): string {
    return this.isLeagueMode() ? 'L' : (groupName ?? 'A');
  }

  public qualificationLabel(): string {
    return this.isLeagueMode() ? 'Qualifizierte Teams' : 'Qualifizierte Teams pro Gruppe';
  }

  public qualificationHint(): string {
    return this.isLeagueMode() ? 'Wer kommt in die K.O.-Phase' : 'Wer kommt in die K.O.-Phase';
  }

  public qualifiedTeamOptions(): number[] {
    const teamCount = this.currentTeamCount();
    if (this.isLeagueMode()) {
      return [2, 4, 8, 16].filter(option => option <= teamCount);
    }

    const maxQualified = Math.max(1, Math.min(3, teamCount - 1));
    return Array.from({ length: maxQualified }, (_, index) => index + 1);
  }

  private clampGroupCount(n: number): number {
    if (this.isLeagueMode()) {
      return 1;
    }
    return Math.max(1, Math.min(10, n));
  }

  private clampTeamCount(n: number): number {
    const maxTeams = this.maxTeamsPerGroup();
    return Math.max(3, Math.min(maxTeams, n));
  }

  private normalizeQualifiedTeams(preferMax: boolean): void {
    if (!this.gameForm.get('koStage')?.value) {
      return;
    }

    const options = this.qualifiedTeamOptions();
    const currentValue = this.gameForm.get('numberOfQualifiedTeams')?.value as number | null;

    if (options.length === 0) {
      this.gameForm.get('numberOfQualifiedTeams')?.setValue(null);
      return;
    }

    if (currentValue && options.includes(currentValue) && !preferMax) {
      return;
    }

    this.gameForm.get('numberOfQualifiedTeams')?.setValue(preferMax ? options[options.length - 1] : options[0]);
  }

  private rebuildGroups(groupCount: number, teamCount: number): void {
    this.groupsFormArray.clear();
    for (let i = 0; i < groupCount; i++) {
      const teamsArray = this.fb.array(
        Array.from({ length: teamCount }, () => new FormControl<string | null>(null, [Validators.required]))
      );

      this.groupsFormArray.push(
        this.fb.group({
          groupName: this.fb.control<string | null>(this.groupNames[i], [Validators.required]),
          teams: teamsArray,
        })
      );
    }
  }

  private getRandomTeamName(): string {
    return DemoTeams[Math.floor(Math.random() * DemoTeams.length)];
  }
}
