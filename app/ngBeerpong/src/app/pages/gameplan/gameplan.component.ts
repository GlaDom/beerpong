import { Component, OnInit } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { GameplanCardComponent } from '../../components/gameplan-card/gameplan-card.component';
import { GroupCardComponent } from '../../components/group-card/group-card.component';
import { BeerpongState } from '../../store/beerpong/game.state';
import { Store } from '@ngrx/store';
import Match from '../../api/match.interface';
import { selectBeerpongState } from '../../store/beerpong/beerpong.selectors';
import { ConfigurationService } from '../../services/configuration.service';
import { NgFor, NgIf } from '@angular/common';
import Group from '../../api/group.interface';
import { FieldsetModule } from 'primeng/fieldset';
import { Observable } from 'rxjs';
import { RankingComponent } from '../../components/ranking/ranking.component';
import Team from '../../api/team.interface';
import { GameplanOGfTComponent } from '../../components/gameplan-components/gameplan-o-gf-t/gameplan-o-gf-t.component';
import { GameplanSGfTComponent } from "../../components/gameplan-components/gameplan-s-gf-t/gameplan-s-gf-t.component";

@Component({
    selector: 'app-gameplan',
    imports: [
        DividerModule,
        NgIf,
        FieldsetModule,
        RankingComponent,
        GameplanOGfTComponent,
        GameplanSGfTComponent
    ],
    templateUrl: './gameplan.component.html',
    styleUrl: './gameplan.component.css'
})
export class GameplanComponent implements OnInit {

  game$: Observable<BeerpongState>;
  groups: Group[] = [];
  matches: Match[] = [];
  regularMatches: Match[][] = [];
  roundOfsixteen: Match[] = [];
  quaterFinals: Match[] = [];
  semiFinals: Match[] = [];
  final: Match[] = [];

  isLoading: boolean = true;
  showRanking: boolean = false;

  constructor(
    private configService: ConfigurationService,
    private beerpongstore: Store<BeerpongState>
  ){
    this.game$ = this.beerpongstore.select(selectBeerpongState)
  }

  ngOnInit(): void {
    this.game$.subscribe((game) => {
      console.log(game)
      if(game.groups && game.groups.length > 0) {
        this.groups = game.groups
        this.matches = game.matches
        this.showRanking = game.showRanking
        this.regularMatches = this.configService.sortMatches(this.matches);
        this.roundOfsixteen = this.configService.filterMatches('round_of_16', this.matches)
        this.quaterFinals = this.configService.filterMatches('quaterfinal', this.matches)
        this.semiFinals = this.configService.filterMatches('semifinal', this.matches)
        this.final = this.configService.filterMatches('final', this.matches)      
      }
      this.isLoading = game.isLoading
    })
  }

  getBestEightTeams(): Team[] {
    let retval: Team[] = this.configService.sortTeamsbyPointsAndDifferenze(this.groups);
    return retval
  }
}
