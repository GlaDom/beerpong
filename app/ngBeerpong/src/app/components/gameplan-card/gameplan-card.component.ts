import { Component, Input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import Match from '../../api/match.interface';

@Component({
  selector: 'app-gameplan-card',
  standalone: true,
  imports: [
    CardModule,
    ChipModule,
    DividerModule
  ],
  templateUrl: './gameplan-card.component.html',
  styleUrl: './gameplan-card.component.css'
})
export class GameplanCardComponent {
  @Input()
  match?: Match;

  constructor() {}

  getColor(points: number | undefined): string {
    let retval: string = ""
    if(points && this.match) {
      if(points == 0) {
        return retval
      } else if(points == this.match.points_home) {
        if(points>this.match.points_away) {
          retval = "bg-green-400"
        } else {
          retval = "bg-red-400"
        }
      } else {
        if(points>this.match.points_home) {
          retval = "bg-green-400"
        } else {
          retval = "bg-red-400"
        }
      }
    }
    return retval
  }
}
