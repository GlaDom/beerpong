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
import { PanelModule } from 'primeng/panel';
import { FieldsetModule } from 'primeng/fieldset';

@Component({
  selector: 'app-game-plan',
  standalone: true,
  imports: [
    GameCardComponent,
    NgIf,
    NgFor,
    TabViewModule,
    ButtonModule,
    PanelModule,
    FieldsetModule
  ],
  templateUrl: './admin-space.component.html',
  styleUrl: './admin-space.component.css'
})
export class AdminSpaceComponent implements OnInit {

    //$game: Observable<BeerpongGame>
    matches: Match[] = []
    sortedMatches: Match[][] = []
    quaterFinalMatches: Match[] = []
    semiFinalMatches: Match[] = []
    finalMatch: Match[] = [] 
    loading: boolean = true

    constructor(
      private configService: ConfigurationService,
      private beerpongStore: Store<BeerpongGame>,
    ) {}

    ngOnInit(): void {
      this.beerpongStore.select(selectGame).subscribe((game: any) => {
        if(game.beerpong.matches.length>0) {
          this.matches = game.beerpong.matches
          this.sortedMatches = this.configService.sortMatches(this.matches)
          this.quaterFinalMatches = this.configService.filterMatches('quaterfinal', this.matches)
          this.semiFinalMatches = this.configService.filterMatches('semifinal', this.matches)
          this.finalMatch = this.configService.filterMatches('final', this.matches)
          this.loading = false
        }
      })
    }

    
}
