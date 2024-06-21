import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { StepsModule } from 'primeng/steps';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { FormArray, FormBuilder, FormControl, FormGroup, RequiredValidator, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { StepperModule } from 'primeng/stepper';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import Game from '../../api/game.interface';
import { GameRequest } from '../../api/game-request';
import Team from '../../api/team.interface';
import Group from '../../api/group.interface';
import { DemoTeams } from './demo-teams';
import { BeerpongState } from '../../store/game.state';
import { Store } from '@ngrx/store';
import { createGame } from '../../store/beerpong.actions';
import { Referee } from '../../api/referee';

enum GameMode {
  GAMEMODE_30_TEAMS = 1,
  GAMEMODE_10_TEAMS = 2 
}

@Component({
  selector: 'app-beerpong-setup',
  templateUrl: './beerpong-setup.component.html',
  styleUrl: './beerpong-setup.component.css',
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    StepsModule,
    ToggleButtonModule,
    NgIf,
    NgFor,
    InputTextModule,
    DividerModule,
    ReactiveFormsModule,
    StepperModule,
    InputNumberModule,
    CalendarModule
  ]
})
export class BeerpongSetupComponent implements OnInit {

  
  GAMEMODE_30_TEAMS: string = '6 Gruppen je 5 Teams';
  GAMEMODE_10_TEAMS: string = '1 Gruppe je 5 Teams';
  gameForm: FormGroup;
  refereeFormGroup: FormGroup;
  gameMode: FormGroup;
  playMode: number = 0;
  groupNames: string[] = ["A", "B", "C", "D", "E", "F"]
  enableButton: boolean= false;
  gameModeSet: boolean = false;
  teamsSet: boolean = false;

  constructor(
    private fb: FormBuilder,
    private beerpongstore: Store<BeerpongState>
  ) {
    this.gameForm = this.fb.group({
      groups: this.fb.array([])
    })
    this.gameMode = new FormGroup({
      mode: new FormControl<string>('')
    })
    this.refereeFormGroup = new FormGroup({
      referees: new FormControl<string>(''),
      gameTime: new FormControl<number | null>(null),
      date: new FormControl<Date | null>(null),
    })
    for(let i=0;i<=5;i++) {
      let groupForm = this.fb.group({
        name: new FormControl(this.groupNames[i]),
        team1: new FormControl('', [Validators.required, Validators.minLength(3)]),
        team2: new FormControl('', [Validators.required, Validators.minLength(3)]),
        team3: new FormControl('', [Validators.required, Validators.minLength(3)]),
        team4: new FormControl('', [Validators.required, Validators.minLength(3)]),
        team5: new FormControl('', [Validators.required, Validators.minLength(3)])
      })

      this.groups.push(groupForm)
    }
  }
    
  ngOnInit(): void {

  }

  get groups() {
    return this.gameForm.controls["groups"] as FormArray;
  }

  toggleGameModeSet(): void {
    this.gameModeSet = !this.gameModeSet
  }
  
  toggleEnableButton(mode: number): void {
    this.enableButton = !this.enableButton
    if(this.enableButton) {
      this.playMode = mode
    }
    // this.gameMode.setValue({mode: mode})
  }

  startGame(): void {
    console.log(this.gameForm)
    console.log(this.refereeFormGroup)
    console.log(this.gameMode)
    let refs: string = this.refereeFormGroup.get('referees')?.value
    console.log(refs.split(','))
    let refsArray = refs.trim().split(',')
    let referees: Referee[] = [];
    refsArray.map(r => referees.push({name: r}))
    let newGame: GameRequest = {
      game: {
        mode: this.playMode,
        amount_of_teams: 30,
        is_finished: false,
        game_time: this.refereeFormGroup.get('gameTime')?.value,
        start_time: this.refereeFormGroup.get('date')?.value,
        referee: referees,
        teams: this.getTeamsForGame()
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

}
