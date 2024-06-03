import { Component } from '@angular/core';
import { GameCardComponent } from '../../components/game-card/game-card.component';
import { ConfigurationService } from '../../services/configuration.service';
import Match from '../../api/match.interface';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-game-plan',
  standalone: true,
  imports: [
    GameCardComponent,
    NgIf,
    NgFor,
  ],
  templateUrl: './game-plan.component.html',
  styleUrl: './game-plan.component.css'
})
export class GamePlanComponent {

    //$game: Observable<BeerpongGame>
    matches: Match[] = []

    matchMap: Map<string, Match[]> = new Map<string, Match[]>();

    constructor(
      private configService: ConfigurationService
    ) {
      this.configService.GetGame("http://localhost:8080/api/v1").subscribe((game) => {
        this.matches = game.matches.filter((m: Match) => m.type=="regular")
        
      })
    }


}
