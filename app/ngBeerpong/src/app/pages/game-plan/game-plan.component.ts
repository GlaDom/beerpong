import { Component, OnInit } from '@angular/core';
import { GameCardComponent } from '../../components/game-card/game-card.component';
import { ConfigurationService } from '../../services/configuration.service';
import Match from '../../api/match.interface';
import { NgFor, NgIf } from '@angular/common';
import { Store } from '@ngrx/store';
import { BeerpongGame } from '../../store/game.state';
import { selectGame } from '../../store/beerpong.selectors';
import { TabViewModule } from 'primeng/tabview';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-game-plan',
  standalone: true,
  imports: [
    GameCardComponent,
    NgIf,
    NgFor,
    TabViewModule,
    ButtonModule
  ],
  templateUrl: './game-plan.component.html',
  styleUrl: './game-plan.component.css'
})
export class GamePlanComponent implements OnInit {

    //$game: Observable<BeerpongGame>
    matches: Match[] = []
    sortedMatches: Match[][] = []
    loading: boolean = true

    constructor(
      private configService: ConfigurationService,
      private beerpongStore: Store<BeerpongGame>,
    ) {}

    ngOnInit(): void {
      this.beerpongStore.select(selectGame).subscribe((game: any) => {
        if(game.beerpong.matches.length>0) {
          this.matches = game.beerpong.matches
          this.sortedMatches = this.sortMatches(this.matches)
          this.loading = false
        }
      })
    }

    sortMatches(matches: Match[]): Match[][] {
      let retval: Match[][] = [[], [], [], [], [], []]
      for(let i = 0;i<matches.length;i++) {
        switch(matches[i].group_number) {
          case "A": {
            retval[0].push(matches[i]);
            break;
          }
          case "B": {
            retval[1].push(matches[i]);
            break;
          }
          case "C": {
            retval[2].push(matches[i]);
            break;
          }
          case "D": {
            retval[3].push(matches[i]);
            break;
          }
          case "E": {
            retval[4].push(matches[i]);
            break;
          }
          case "F": {
            retval[5].push(matches[i]);
            break;
          }
          case "": {
            break;
          }
          default: 
            break
        }
      }
      return retval
    }
}
