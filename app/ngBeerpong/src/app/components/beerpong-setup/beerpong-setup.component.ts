import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { StepsModule } from 'primeng/steps';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, RequiredValidator, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { StepperModule } from 'primeng/stepper';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { Team } from '../../api/team.interface';
import { DemoTeams } from './demo-teams';
import { BeerpongState } from '../../store/beerpong/game.state';
import { Store } from '@ngrx/store';
import { createGame } from '../../store/beerpong/beerpong.actions';
import { Referee } from '../../api/referee';
import { PanelModule } from 'primeng/panel';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { Observable } from 'rxjs';
import { UserState } from '../../store/user/user.state';
import { selectUserState } from '../../store/user/user.selectors';
import { uniqueTeamNamesValidator } from '../../shared/validators/duplicate-team-names-validator';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { NewTournament } from '../../api/game-request';
import GroupModel from '../../form-models/group.model';
import Group from '../../api/group.interface';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-beerpong-setup',
  templateUrl: './beerpong-setup.component.html',
  styleUrl: './beerpong-setup.component.css',
  imports: [
    ButtonModule,
    CardModule,
    StepsModule,
    ToggleButtonModule,
    NgFor,
    InputTextModule,
    DividerModule,
    ReactiveFormsModule,
    StepperModule,
    InputNumberModule,
    CalendarModule,
    FormsModule,
    PanelModule,
    ToggleSwitchModule,
    DatePipe,
    TooltipModule,
    CommonModule,
    SelectModule,
    MessageModule
  ]
})
export class BeerpongSetupComponent implements OnInit {
  // user
  private userDetails$: Observable<UserState>;
  private userSub: string;
  private userObserver = {
    next: (u: UserState) => this.userSub = u.userDetails.sub!,
    error: (err: Error) => console.log(err),
    complete: () => console.log('user observable completed on beerpong setup component')
  }

  // game
  public gameForm: FormGroup;

  groupNames: string[] = ["A", "B", "C", "D", "E", "F"]
  teamsSet: boolean = false;

  public groupOptions: Number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  public teamOptions: Number[] = [3, 4, 5];
  public qualifiedTeamsOptions: Number[] = [1, 2];

  constructor(
    private fb: FormBuilder,
    private beerpongstore: Store<BeerpongState>,
    private userstore: Store<UserState>,
  ) {
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
      gameTime: this.fb.control<number | null>(null, [Validators.required]),
      gameStart: this.fb.control<Date | null>(null, [Validators.required]),
      koStage: this.fb.control<boolean>(false),
      includeThirdPlaceMatch: this.fb.control<boolean>(false),
      numberOfQualifiedTeams: this.fb.control<number | null>(1, [Validators.required]),
      withReferees: this.fb.control<boolean>(false),
      referees: this.fb.control<string | null>(null),
    })

    this.userDetails$ = this.userstore.select(selectUserState)
  }

  ngOnInit(): void {
    this.userDetails$.subscribe(this.userObserver)
  }

  get groupsFormArray(): FormArray {
    return this.gameForm.controls["groups"] as FormArray;
  }

  public getTeamsFromArray(groupIndex: number): FormArray {
    return this.groupsFormArray.at(groupIndex).get('teams') as FormArray;
  }

  get amountOfGroups(): FormControl {
    return this.gameForm.controls["amountOfGroups"] as FormControl;
  }

  get amountOfTeams(): FormControl {
    return this.gameForm.controls["amountOfTeams"] as FormControl;
  }

  get gameTime(): FormControl {
    return this.gameForm.controls["gameTime"] as FormControl;
  }

  public updateGroupNumber(event: SelectChangeEvent): void {
    console.log(event.value);
    this.groupsFormArray.clear();
    for (let i = 0; i < event.value; i++) {
      this.groupsFormArray.push(
        this.fb.group({
          groupName: this.fb.control<string | null>(this.groupNames[i], [Validators.required]),
          teams: this.fb.array([])
        })
      )
    }
    this.groupsFormArray.controls.forEach(group => {
      // Add number of teams to each group
      for (let j = 0; j < this.amountOfTeams.value!; j++) {
        (group.get('teams') as FormArray).push(new FormControl<string | null>(null, [Validators.required]));
      }
    })
  }

  public updateTeamNumber(event: SelectChangeEvent): void {
    const teamCount = event.value;
    this.groupsFormArray.controls.forEach(group => {
      const teamsArray = group.get('teams') as FormArray;
      // Clear existing teams
      teamsArray.clear();
      // Add new number of teams
      for (let j = 0; j < teamCount; j++) {
        teamsArray.push(new FormControl<string | null>(null, [Validators.required]));
      }
    })
  }

  startGame(): void {
    console.log(this.gameForm)
    let referees: Referee[] | null = null;
    console.log(this.gameForm.get('referees')?.value)
    if (this.gameForm.get('referees')?.value) {
      let refs: string = this.gameForm.get('referees')?.value
      let refsArray = refs.trim().split(',')
      refsArray.map(r => referees!.push({
        name: r,
      }))
    }
    let newGame: NewTournament = {
      tournament: {
        user_sub: this.userSub,
        amount_of_teams: this.gameForm.get('amountOfTeams')?.value,
        is_finished: false,
        game_time: this.gameForm.get('gameTime')?.value,
        start_time: this.gameForm.get('gameStart')?.value,
        referee: referees!,
        groups: this.getGroupsForNewGame(),
        got_ko_stage: this.gameForm.get('koStage')?.value,
        got_stage_in_between: this.gameForm.get('includeThirdPlaceMatch')?.value,
        number_of_qualified_teams: this.gameForm.get('numberOfQualifiedTeams')?.value,
        include_third_place_match: this.gameForm.get('includeThirdPlaceMatch')?.value,
      },
    }

    this.beerpongstore.dispatch(createGame({ game: newGame }))

    console.log(newGame)
  }

  // getTeamsForGame(): Team[] {
  //   let retval: Team[] = []
  //   console.log(this.groupsFormArray.value)
  //   let groups: any = this.groupsFormArray.value
  //   for (let i = 0; i < groups.length; i++) {
  //     let newTeams: Team[] = []
  //     newTeams.push(this.getNewTeam(groups[i].name, groups[i].team1))
  //     newTeams.push(this.getNewTeam(groups[i].name, groups[i].team2))
  //     newTeams.push(this.getNewTeam(groups[i].name, groups[i].team3))
  //     newTeams.push(this.getNewTeam(groups[i].name, groups[i].team4))
  //     newTeams.push(this.getNewTeam(groups[i].name, groups[i].team5))
  //     retval.push(...newTeams)
  //   }
  //   return retval
  // }

  getNewTeam(grouName: string, teamName: string): Team {
    let retval: Team = {
      team_name: teamName,
      group_name: grouName,
      points: 0,
      cups_hit: 0,
      cups_get: 0,
      cup_difference: 0,
      rank: 0
    }
    if (retval.team_name == '') {
      retval.team_name = this.getRandomTeamName()
    }
    return retval
  }

  getRandomTeamName(): string {
    let index = Math.floor(Math.random() * (29 - 0 + 1) + 0);
    return DemoTeams[index]
  }

  fillGroupsWithTeamNames(): void {
    this.groupsFormArray.controls.forEach(groupControl => {
      const teamsArray = groupControl.get('teams') as FormArray;
      teamsArray.controls.forEach(teamControl => {
        teamControl.setValue(this.getRandomTeamName());
      });
    });
    console.log(this.groupsFormArray)
  }

  private getGroupsForNewGame(): Group[] {
    let groups: Group[] = [];
    this.groupsFormArray.controls.forEach((groupControl, index) => {
      const groupName = groupControl.get('groupName')?.value;
      const teamsArray = groupControl.get('teams') as FormArray;
      const teams: Team[] = teamsArray.controls.map(teamControl => ({
        team_name: teamControl.value || this.getRandomTeamName(),
        group_name: groupName,
        points: 0,
        cups_hit: 0,
        cups_get: 0,
        cup_difference: 0,
        rank: 0
      }));
      groups.push({ group_name: groupName, teams: teams});
    });
    return groups;
  }
}
