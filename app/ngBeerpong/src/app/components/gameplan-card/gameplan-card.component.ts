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

}
