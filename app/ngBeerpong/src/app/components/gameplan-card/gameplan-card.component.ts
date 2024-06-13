import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';

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

}
