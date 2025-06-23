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
import {Team} from '../../api/team.interface';
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
import { SelectModule } from 'primeng/select';
import { NewTournament } from '../../api/game-request';

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
        SelectModule
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
      groups: this.fb.array([], uniqueTeamNamesValidator()),
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

  get groups(): FormArray {
    return this.gameForm.controls["groups"] as FormArray;
  }

  get amountOfGroups(): FormControl {
    return this.gameForm.controls["amountOfGroups"] as FormControl;
  }

  get gameTime(): FormControl {
    return this.gameForm.controls["gameTime"] as FormControl;
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
        amount_of_teams: 0,
        is_finished: false,
        game_time: this.gameForm.get('gameTime')?.value,
        start_time: this.gameForm.get('startTime')?.value,
        referee: referees!,
        groups: [],
        got_ko_stage: false,
        got_stage_in_between: false,
        number_of_qualified_teams: 0,
        include_third_place_match: false
      },
    }

    this.beerpongstore.dispatch(createGame({game: newGame}))

    console.log(newGame)
  }

  getTeamsForGame(): Team[] {
    let retval: Team[] = []
    console.log(this.groups.value)
    let groups: any = this.groups.value
    for(let i=0; i<groups.length;i++) {
      let newTeams: Team[] = []
      newTeams.push(this.getNewTeam(groups[i].name, groups[i].team1))
      newTeams.push(this.getNewTeam(groups[i].name, groups[i].team2))
      newTeams.push(this.getNewTeam(groups[i].name, groups[i].team3))
      newTeams.push(this.getNewTeam(groups[i].name, groups[i].team4))
      newTeams.push(this.getNewTeam(groups[i].name, groups[i].team5))
      retval.push(...newTeams)
    }
    return retval
  }

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
    if(retval.team_name=='') {
      retval.team_name = this.getRandomTeamName()
    }
    return retval 
  }

  getRandomTeamName(): string {
    let index = Math.floor(Math.random() * (29 - 0 + 1) + 0);
    return DemoTeams[index]
  }

  fillGroupsWithTeamNames(): void {
    let groups: any = this.groups.value
    for(let i=0; i<groups.length;i++) {
      groups[i].team1 = this.getRandomTeamName()
      groups[i].team2 = this.getRandomTeamName()
      groups[i].team3 = this.getRandomTeamName()
      groups[i].team4 = this.getRandomTeamName()
      groups[i].team5 = this.getRandomTeamName()
    }
    this.groups.setValue(groups)
    console.log(this.groups)
  }

}
