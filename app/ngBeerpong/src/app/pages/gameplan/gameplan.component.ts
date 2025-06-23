import { Component, OnInit } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { BeerpongState } from '../../store/beerpong/game.state';
import { Store } from '@ngrx/store';
import {Match} from '../../api/match.interface';
import { selectBeerpongState } from '../../store/beerpong/beerpong.selectors';
import { ConfigurationService } from '../../services/configuration.service';
import Group from '../../api/group.interface';
import { FieldsetModule } from 'primeng/fieldset';
import { Observable } from 'rxjs';
import {Team} from '../../api/team.interface';
import { GameplanOGfTComponent } from '../../components/gameplan-components/gameplan-o-gf-t/gameplan-o-gf-t.component';
import { GameplanSGfTComponent } from "../../components/gameplan-components/gameplan-s-gf-t/gameplan-s-gf-t.component";
import { TableViewComponent } from '../../components/table-view/table-view.component';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { loadGame } from '../../store/beerpong/beerpong.actions';

@Component({
    selector: 'app-gameplan',
    imports: [
        DividerModule,
        FieldsetModule,
        GameplanOGfTComponent,
        GameplanSGfTComponent,
        TableViewComponent,
        CardModule,
        ButtonModule,
        FormsModule,
        TooltipModule,
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

  public showTableView = false;
  public isLoading: boolean = true;
  public showRanking: boolean = false;

  constructor(
    private configService: ConfigurationService,
    private beerpongstore: Store<BeerpongState>
  ){
    this.game$ = this.beerpongstore.select(selectBeerpongState)
    this.beerpongstore.dispatch(loadGame())
  }

  ngOnInit(): void {
    this.game$.subscribe((game) => {
      console.log(game)
      if(game.currentGame.groups && game.currentGame.groups.length > 0) {
        this.groups = game.currentGame.groups
        this.matches = game.currentGame.matches
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

  public toggleShowTableView() {
    this.showTableView = !this.showTableView;
  }
}
