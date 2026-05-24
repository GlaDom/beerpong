import { Component, OnDestroy, OnInit } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { BeerpongState } from '../../store/beerpong/game.state';
import { Store } from '@ngrx/store';
import { Match } from '../../api/match.interface';
import { selectBeerpongState, selectShowRanking } from '../../store/beerpong/beerpong.selectors';
import { ConfigurationService } from '../../services/configuration.service';
import Group from '../../api/group.interface';
import { FieldsetModule } from 'primeng/fieldset';
import { Observable } from 'rxjs';
import { Team } from '../../api/team.interface';
import { GameplanOGfTComponent } from '../../components/gameplan-components/gameplan-o-gf-t/gameplan-o-gf-t.component';
import { GameplanSGfTComponent } from "../../components/gameplan-components/gameplan-s-gf-t/gameplan-s-gf-t.component";
import { TableViewComponent } from '../../components/table-view/table-view.component';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { loadGame } from '../../store/beerpong/beerpong.actions';
import { RankingComponent } from '../../components/ranking/ranking.component';

@Component({
  selector: 'app-gameplan',
  imports: [
    DividerModule,
    FieldsetModule,
    GameplanOGfTComponent,
    GameplanSGfTComponent,
    TableViewComponent,
    RankingComponent,
    CardModule,
    ButtonModule,
    FormsModule,
    TooltipModule,
  ],
  templateUrl: './gameplan.component.html',
  styleUrl: './gameplan.component.css'
})
export class GameplanComponent implements OnInit, OnDestroy {

  game$: Observable<BeerpongState>;
  showRanking$: Observable<boolean | undefined>;
  groups: Group[] = [];
  matches: Match[] = [];
  regularMatches: Match[][] = [];
  roundOfsixteen: Match[] = [];
  quaterFinals: Match[] = [];
  semiFinals: Match[] = [];
  final: Match[] = [];

  public showTableView = false;
  public isLoading: boolean = true;
  public showRanking: boolean | undefined;

  private reloadTime: number = 30000; //time in ms to reload the gameplan
  private reloadInterval: any;

  constructor(
    private configService: ConfigurationService,
    private beerpongstore: Store<BeerpongState>
  ) {
    this.game$ = this.beerpongstore.select(selectBeerpongState)
    this.showRanking$ = this.beerpongstore.select(selectShowRanking)
    this.beerpongstore.dispatch(loadGame())
  }

  ngOnInit(): void {
    this.game$.subscribe((game) => {
      console.log(game)
      if (game.currentGame.tournament.groups && game.currentGame.tournament.groups.length > 0) {
        this.groups = this.configService.sortTeamsInGroups(game.currentGame.tournament.groups);
        this.matches = game.currentGame.tournament.matches!
        this.showRanking = game.showRanking
        this.regularMatches = this.configService.sortMatches(this.matches);
        this.roundOfsixteen = this.configService.filterMatches('round_of_16', this.matches)
        this.quaterFinals = this.configService.filterMatches('quaterFinal', this.matches)
        this.semiFinals = this.configService.filterMatches('semiFinal', this.matches)
        this.final = this.configService.filterMatches('final', this.matches)
      }
      this.isLoading = game.isLoading
    })
    this.showRanking$.subscribe((show) => {
      console.log("Show Ranking: ", show)
      this.showRanking = show
    })
    this.reloadInterval = setInterval(() => {
      this.beerpongstore.dispatch(loadGame())
    }, this.reloadTime);
  }

  getBestEightTeams(): Team[] {
    let retval: Team[] = this.configService.sortTeamsbyPointsAndDifferenze(this.groups);
    return retval
  }

  public toggleShowTableView() {
    this.showTableView = !this.showTableView;
  }

  ngOnDestroy(): void {
    if (this.reloadInterval) {
      clearInterval(this.reloadInterval);
    }
  }
}
