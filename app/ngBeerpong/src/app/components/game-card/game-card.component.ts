import { Component, Input, OnInit, Output } from '@angular/core';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { ChipModule } from 'primeng/chip';
import { ButtonModule } from 'primeng/button';
import Match from '../../api/match.interface';
import { FormsModule, NgModel } from '@angular/forms';
import { BeerpongGame } from '../../store/game.state';
import { Store } from '@ngrx/store';
import { updateMatch } from '../../store/beerpong.actions';
import { EventEmitter } from 'stream';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [
    CardModule,
    DividerModule,
    InputNumberModule,
    ChipModule,
    ButtonModule,
    FormsModule
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

  points_home: number = 0;
  points_away: number = 0;

  locked: boolean = false;
  label: 'success' | 'info' | 'warning' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' | null | undefined = "primary";

  constructor(
    private beerpongstore: Store<BeerpongGame>,
  ) {}

  ngOnInit(): void {
    if(this.match.points_home>0 || this.match.points_away>0) {
      this.points_home = this.match.points_home
      this.points_away = this.match.points_away
      this.locked = !this.locked
      this.label = 'contrast'
    }
  }

  setLocked(): void {
    this.locked = !this.locked
    if(this.label == 'primary') {
      this.label = 'contrast'
      if(this.match.group_number != '' && this.match.game_id != 0) {
        let m: Match = this.getCopyOfMatch(this.match)
        console.log(this.points_home, this.points_away)
        m.points_home = this.points_home
        m.points_away = this.points_away
        console.log(m)
        this.beerpongstore.dispatch(updateMatch({match: m}))
      }
    } else {
      this.label = 'primary'
    }
  }

  getCopyOfMatch(m: Match): Match{
    let newMatch: Match = {
      game_id: m.game_id,
      type: m.type,
      group_number: m.group_number,
      home_team: m.home_team,
      away_team: m.away_team,
      points_home: this.points_home,
      points_away: this.points_away,
    }
    return newMatch
  }
}
