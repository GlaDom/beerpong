import { Component, OnInit } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { GameplanCardComponent } from '../../components/gameplan-card/gameplan-card.component';
import { GroupCardComponent } from '../../components/group-card/group-card.component';
import { BeerpongGame } from '../../store/game.state';
import { Store } from '@ngrx/store';
import Match from '../../api/match.interface';
import { selectGame } from '../../store/beerpong.selectors';
import { ConfigurationService } from '../../services/configuration.service';
import { NgFor, NgIf } from '@angular/common';
import Group from '../../api/group.interface';
import { FieldsetModule } from 'primeng/fieldset';

@Component({
  selector: 'app-gameplan',
  standalone: true,
  imports: [
    GameplanCardComponent,
    GroupCardComponent,
    DividerModule,
    NgFor,
    NgIf,
    FieldsetModule
  ],
  templateUrl: './gameplan.component.html',
  styleUrl: './gameplan.component.css'
})
export class GameplanComponent implements OnInit {

  groups: Group[] = [];
  matches: Match[] = [];
  regularMatches: Match[][] = [];
  quaterFinals: Match[] = [];
  semiFinals: Match[] = [];
  final: Match[] = [];

  constructor(
    private configService: ConfigurationService,
    private beerpongstore: Store<BeerpongGame>
  ){}

  ngOnInit(): void {
    this.beerpongstore.select(selectGame).subscribe((game: any) => {
      if(game.beerpong.groups && game.beerpong.groups.length > 0) {
        this.groups = game.beerpong.groups
        this.matches = game.beerpong.matches
        this.regularMatches = this.configService.sortMatches(this.matches)
        this.quaterFinals = this.configService.filterMatches('quaterfinal', this.matches)
        this.semiFinals = this.configService.filterMatches('semifinal', this.matches)
        this.final = this.configService.filterMatches('final', this.matches)      
      }
    })
  }

}
