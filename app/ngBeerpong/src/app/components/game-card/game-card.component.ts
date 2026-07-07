import { Component, Input, OnInit } from '@angular/core';
import { Match } from '../../api/match.interface';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BeerpongStore } from '../../store/beerpong/beerpong.store';
import { inject } from '@angular/core';
import { TeamUpdate } from '../../api/team-update.interface';
import { DatePipe } from '@angular/common';
import { numericValidator } from '../../shared/validators/numeric-validator';

@Component({
    selector: 'app-game-card',
    imports: [DatePipe, ReactiveFormsModule],
    templateUrl: './game-card.component.html',
    styleUrl: './game-card.component.css'
})
export class GameCardComponent implements OnInit {

  @Input()
  match: Match = {
    tournament_id: 0,
    type: '',
    group_number: '',
    home_team: '',
    away_team: '',
    points_home: 0,
    points_away: 0,
    start_time: '',
  }

  @Input()
  showGroupName: boolean = true;

  points = new FormGroup({
    points_home: new FormControl<number>({value: 0, disabled: false}, [Validators.required, numericValidator()]),
    points_away: new FormControl<number>({value: 0, disabled: false}, [Validators.required, numericValidator()]),
  })

  label: "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | "help" | "primary" | null | undefined = 'primary';

  private beerpongStore = inject(BeerpongStore);

  get isLockedState(): boolean { return this.label === 'contrast'; }

  get homeWins(): boolean {
    return this.isLockedState && (this.points_home?.value ?? 0) > (this.points_away?.value ?? 0);
  }

  get awayWins(): boolean {
    return this.isLockedState && (this.points_away?.value ?? 0) > (this.points_home?.value ?? 0);
  }

  ngOnInit(): void {
    if(this.match.points_home>0 || this.match.points_away>0) {
      this.points_home?.setValue(this.match.points_home)
      this.points_away?.setValue(this.match.points_away)
      this.points_home?.disable()
      this.points_away?.disable()
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
      this.beerpongStore.setToastStatus('invalid match result');
      return
    }
    if(this.label == 'primary') {
      this.label = 'contrast'
      // decide whether the team points must also be updated or the game status was already set once
      // TODO: handle special case where the points where entered wrong and the other team has won 
      let updateTeamPoints: boolean = false;
      if(typeof this.points_home?.value === 'number' && typeof this.points_away?.value === 'number') {
        updateTeamPoints = this.match.points_home===0 || this.match.points_away===0
      }
      if(this.match.group_number != '' && this.match.tournament_id != 0) {
        let m: Match = this.getCopyOfMatch(this.match)
        if(typeof this.points_home?.value === 'number') {
          m.points_home = this.points_home.value
        }
        if(typeof this.points_away?.value === 'number') {
          m.points_away = this.points_away.value
        }
        this.beerpongStore.updateMatch(m);
        const teamsToUpdate = this.getTeamsToUpdate(m, updateTeamPoints);
        this.beerpongStore.updateTeams(teamsToUpdate);
        this.points_home?.disable()
        this.points_away?.disable()
      }
    } else {
      this.label = 'primary'
      this.points_home?.enable()
      this.points_away?.enable()
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
      id: m.id,
      tournament_id: m.tournament_id,
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

  private getTeamGroupName(teamName: string, fallback: string): string {
    for (const group of this.beerpongStore.groups()) {
      if (group.teams.some(t => t.team_name === teamName)) {
        return group.group_name;
      }
    }
    return fallback;
  }

  getTeamsToUpdate(match: Match, updatePoints: boolean): TeamUpdate[] {
    let retval: TeamUpdate[] = []
    // Auswaertsteam
    let teamOne: TeamUpdate = {
      tournament_id: match.tournament_id,
      team_name: match.away_team,
      group_name: this.getTeamGroupName(match.away_team, match.group_number),
      points_to_add: 0,
      cups_hitted: match.points_away,
      cups_got: match.points_home
    }
    // Heimteam
    let teamTwo: TeamUpdate = {
      tournament_id: match.tournament_id,
      team_name: match.home_team,
      group_name: this.getTeamGroupName(match.home_team, match.group_number),
      points_to_add: 0,
      cups_hitted: match.points_home,
      cups_got: match.points_away
    }
    console.log(match.points_home, match.points_away)
    // Wenn auwaerts mehr getroffen, dann sieg team one
    if(match.points_away>match.points_home && updatePoints) {
      teamOne.points_to_add=3;
    } else if(updatePoints) {
      teamTwo.points_to_add=3;
    }
    retval.push(teamOne)
    retval.push(teamTwo)
    return retval
  }
}
