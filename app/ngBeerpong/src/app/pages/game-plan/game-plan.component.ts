import { Component } from '@angular/core';
import { GameCardComponent } from '../../components/game-card/game-card.component';

@Component({
  selector: 'app-game-plan',
  standalone: true,
  imports: [
    GameCardComponent
  ],
  templateUrl: './game-plan.component.html',
  styleUrl: './game-plan.component.css'
})
export class GamePlanComponent {

}
