import { Component, Input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import {Match} from '../../api/match.interface';
import { TagModule } from 'primeng/tag';
import { DatePipe, NgIf } from '@angular/common';

@Component({
    selector: 'app-gameplan-card',
    imports: [
        CardModule,
        ChipModule,
        DividerModule,
        TagModule,
        DatePipe,
        NgIf
    ],
    templateUrl: './gameplan-card.component.html',
    styleUrl: './gameplan-card.component.css'
})
export class GameplanCardComponent {
  @Input()
  match?: Match;

  @Input()
  showGroupName: boolean = true;

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
