import { Component, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DatePicker } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputTextModule } from 'primeng/inputtext';
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
  private userStore = inject(UserStore);
  private beerpongStore = inject(BeerpongStore);
  private router = inject(Router);

  public currentStep = signal(0);

  public readonly steps = [
    { label: 'Spieleinstellungen' },
    { label: 'Mannschaften' },
    { label: 'Übersicht' },
  ];

  public readonly groupNames = ['A','B','C','D','E','F','G','H','I','J'];

  public gameForm: FormGroup;
  private groupsStatus = signal<string>('INVALID');

  public canAdvance = computed(() => {
    if (this.currentStep() === 0) {
      const g = this.amountOfGroups.value ?? 0;
      const t = this.amountOfTeams.value ?? 0;
      return g >= 1 && t >= 3;
    }
    if (this.currentStep() === 1) {
      return this.groupsStatus() === 'VALID';
    }
    return true;
  });

  constructor(private fb: FormBuilder) {
    this.gameForm = this.fb.group({
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
      numberOfQualifiedTeams: this.fb.control<number | null>(8, [Validators.required]),
      withReferees: this.fb.control<boolean>(false),
      referees: this.fb.control<string | null>(null),
    });

    this.gameForm.controls['groups'].statusChanges.subscribe(status => {
      this.groupsStatus.set(status);
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

  public setGroups(n: number): void {
    const count = Math.max(1, Math.min(10, n));
    this.amountOfGroups.setValue(count);
    this.groupsFormArray.clear();
    for (let i = 0; i < count; i++) {
      const teamsArray = this.fb.array(
        Array.from({ length: this.amountOfTeams.value ?? 3 }, () =>
          new FormControl<string | null>(null, [Validators.required])
        )
      );
      this.groupsFormArray.push(
        this.fb.group({
          groupName: this.fb.control<string | null>(this.groupNames[i], [Validators.required]),
          teams: teamsArray,
        })
      );
    }
  }

  public setTeamsPerGroup(n: number): void {
    const count = Math.max(3, Math.min(5, n));
    this.amountOfTeams.setValue(count);
    this.groupsFormArray.controls.forEach(group => {
      const teamsArray = group.get('teams') as FormArray;
      teamsArray.clear();
      for (let j = 0; j < count; j++) {
        teamsArray.push(new FormControl<string | null>(null, [Validators.required]));
      }
    });
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
        amount_of_teams: this.amountOfTeams.value,
        is_finished: false,
        game_time: this.gameTime.value,
        start_time: this.gameForm.get('gameStart')?.value,
        referee: referees,
        groups: this.getGroupsForNewGame(),
        got_ko_stage: this.gameForm.get('koStage')?.value,
        got_stage_in_between: this.gameForm.get('includeThirdPlaceMatch')?.value,
        number_of_qualified_teams: this.gameForm.get('numberOfQualifiedTeams')?.value,
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

  private getRandomTeamName(): string {
    return DemoTeams[Math.floor(Math.random() * DemoTeams.length)];
  }
}
