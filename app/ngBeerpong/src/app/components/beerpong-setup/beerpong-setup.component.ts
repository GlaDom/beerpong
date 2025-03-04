import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
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
import Game from '../../api/game.interface';
import { GameRequest } from '../../api/game-request';
import Team from '../../api/team.interface';
import Group from '../../api/group.interface';
import { DemoTeams } from './demo-teams';
import { BeerpongState } from '../../store/game.state';
import { Store } from '@ngrx/store';
import { createGame } from '../../store/beerpong.actions';
import { Referee } from '../../api/referee';

const GAMEMODE_6_GROUPS = 0;
const GAMEMODE_1_GROUP = 1;

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
    CalendarModule,
    FormsModule,
  ]
})
export class BeerpongSetupComponent implements OnInit {

  public selectedMode: string = '';
  public gameForm: FormGroup;
  public refereeFormGroup: FormGroup;
  public gameMode: FormGroup;

  public buttonLabelSixGroups: string = "6 Gruppen je 5 Teams";
  public buttonLabelOneGroup: string = "1 Gruppe je 5 Teams";

  public buttonsFormGroup: FormGroup = new FormGroup({
    buttonOne: new FormControl<boolean>(false),
    buttonTwo: new FormControl<boolean>(false)
  });

  public playMode: number;
  groupNames: string[] = ["A", "B", "C", "D", "E", "F"]
  gameModeSet: boolean = false;
  teamsSet: boolean = false;

  constructor(
    private fb: FormBuilder,
    private beerpongstore: Store<BeerpongState>
  ) {
    console.log(this.playMode)
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
  }
    
  ngOnInit(): void {

  }

  get groups() {
    return this.gameForm.controls["groups"] as FormArray;
  }
  
  toggleSelectButton(mode: number): void {
    if(mode==0) {
      this.buttonsFormGroup.get('buttonOne')?.setValue(true)
      this.buttonsFormGroup.get('buttonTwo')?.setValue(false)
    } else if(mode==1) {
      this.buttonsFormGroup.get('buttonOne')?.setValue(false)
      this.buttonsFormGroup.get('buttonTwo')?.setValue(true)
    }
    this.playMode = mode === 0 ? GAMEMODE_6_GROUPS : GAMEMODE_1_GROUP;
    console.log(this.playMode)
    switch(mode) {
      case 0: {
        this.groups.clear();
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
        break;
      }
      case 1: {
        this.groups.clear();
        let groupForm = this.fb.group({
          name: new FormControl(this.groupNames[0]),
          team1: new FormControl('', [Validators.required, Validators.minLength(3)]),
          team2: new FormControl('', [Validators.required, Validators.minLength(3)]),
          team3: new FormControl('', [Validators.required, Validators.minLength(3)]),
          team4: new FormControl('', [Validators.required, Validators.minLength(3)]),
          team5: new FormControl('', [Validators.required, Validators.minLength(3)])
        })
  
        this.groups.push(groupForm)
        break;
      }
    }
  }

  startGame(): void {
    console.log(this.gameForm)
    console.log(this.refereeFormGroup)
    console.log(this.gameMode)
    let refs: string = this.refereeFormGroup.get('referees')?.value
    let refsArray = refs.trim().split(',')
    let referees: Referee[] = [];
    refsArray.map(r => referees.push({name: r}))
    let amountOfTeams: number = 30
    if(this.playMode == 1) {
      amountOfTeams = 5
    }
    let newGame: GameRequest = {
      game: {
        mode: this.playMode,
        amount_of_teams: amountOfTeams,
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

}
