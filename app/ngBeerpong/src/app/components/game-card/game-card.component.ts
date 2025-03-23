import { Component, Input, OnInit, Output } from '@angular/core';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { ChipModule } from 'primeng/chip';
import { ButtonModule } from 'primeng/button';
import Match from '../../api/match.interface';
import { FormControl, FormGroup, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { BeerpongState } from '../../store/beerpong/game.state';
import { Store } from '@ngrx/store';
import { setToastStatus, updateMatch, updateTeams } from '../../store/beerpong/beerpong.actions';
import TeamUpdate from '../../api/team-update.interface';
import { TagModule } from 'primeng/tag';
import { DatePipe } from '@angular/common';
import { numericValidator } from '../../shared/validators/numeric-validator';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [
    CardModule,
    DividerModule,
    InputNumberModule,
    ChipModule,
    ButtonModule,
    FormsModule,
    TagModule,
    DatePipe,
    ReactiveFormsModule,
  ],
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.css'
})
export class GameCardComponent implements OnInit {

  @Input()
  match: Match = {
    game_id: 0,
    type: '',
    group_number: '',
    home_team: '',
    away_team: '',
    points_home: 0,
    points_away: 0,
  }

  points = new FormGroup({
    points_home: new FormControl<number>(0, [Validators.required, numericValidator()]),
    points_away: new FormControl<number>(0, [Validators.required, numericValidator()]),
  })

  locked: boolean = false;
  label: 'success' | 'info' | 'warning' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' | null | undefined = "primary";

  constructor(
    private beerpongstore: Store<BeerpongState>,
  ) {}

  ngOnInit(): void {
    if(this.match.points_home>0 || this.match.points_away>0) {
      this.points_home?.setValue(this.match.points_home)
      this.points_away?.setValue(this.match.points_away)
      this.locked = !this.locked
      this.label = 'contrast'
    }
  }

  get points_home() {
    return this.points.get('points_home');
  }

  get points_away() {
    return this.points.get('points_away');
  }

  // method to lock the match points and send request to backend
  setLocked(): void {
    if(this.points_home?.invalid || this.points_away?.invalid) {
      this.beerpongstore.dispatch(setToastStatus({toastStatus: 'invalid match result'}))
      return
    }
    this.locked = !this.locked
    if(this.label == 'primary') {
      this.label = 'contrast'
      // decide whether the team points must also be updated or the game status was already set once
      // TODO: handle special case where the points where entered wrong and the other team has won 
      let updateTeamPoints: boolean = false;
      if(typeof this.points_home?.value === 'number' && typeof this.points_away?.value === 'number') {
        updateTeamPoints = this.points_home.value===0 || this.points_away.value===0
      }
      if(this.match.group_number != '' && this.match.game_id != 0) {
        let m: Match = this.getCopyOfMatch(this.match)
        if(typeof this.points_home?.value === 'number') {
          m.points_home = this.points_home.value
        }
        if(typeof this.points_away?.value === 'number') {
          m.points_away = this.points_away.value
        }
        this.beerpongstore.dispatch(updateMatch({match: m}))
        let teamsToUpdate = this.getTeamsToUpdate(m, updateTeamPoints)
        this.beerpongstore.dispatch(updateTeams({teams: teamsToUpdate}))
      }
    } else {
      this.label = 'primary'
    }
  }

  getCopyOfMatch(m: Match): Match{
    let ph: number = 0;
    let pa: number = 0;
    if(typeof this.points_home?.value === 'number' && typeof this.points_away?.value === 'number') {
      ph = this.points_home.value
      pa = this.points_away.value
    }
    let newMatch: Match = {
      game_id: m.game_id,
      match_id: m.match_id,
      type: m.type,
      group_number: m.group_number,
      home_team: m.home_team,
      away_team: m.away_team,
      points_home: ph,
      points_away: pa,
      referee: m.referee,
      start_time: m.start_time,
      end_time: m.end_time,
    }
    return newMatch
  }

  getTeamsToUpdate(match: Match, updatePoints: boolean): TeamUpdate[] {
    let retval: TeamUpdate[] = []
    let teamOne: TeamUpdate = {
      game_id: match.game_id,
      team_name: match.away_team,
      group_name: match.group_number,
      points_to_add: 0,
      cups_hitted: match.points_away,
      cups_got: match.points_home
    }
    let teamTwo: TeamUpdate = {
      game_id: match.game_id,
      team_name: match.home_team,
      group_name: match.group_number,
      points_to_add: 0,
      cups_hitted: match.points_home,
      cups_got: match.points_away
    }
    if(match.points_away>match.points_home && updatePoints) {
      teamOne.points_to_add=3;
    } else {
      teamTwo.points_to_add=3;
    }
    retval.push(teamOne)
    retval.push(teamTwo)
    return retval
  }
}
