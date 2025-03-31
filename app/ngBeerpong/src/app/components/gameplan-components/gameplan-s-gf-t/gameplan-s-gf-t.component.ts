import { Component, Input } from '@angular/core';
import { GroupCardComponent } from "../../group-card/group-card.component";
import { GameplanCardComponent } from "../../gameplan-card/gameplan-card.component";
import { FieldsetModule } from 'primeng/fieldset';
import { NgFor, NgIf } from '@angular/common';
import Group from '../../../api/group.interface';
import Match from '../../../api/match.interface';

@Component({
    selector: 'app-gameplan-s-gf-t',
    templateUrl: './gameplan-s-gf-t.component.html',
    styleUrl: './gameplan-s-gf-t.component.css',
    imports: [GroupCardComponent, GameplanCardComponent, FieldsetModule, NgIf, NgFor]
})
export class GameplanSGfTComponent {
  @Input()
  regularMatches: Match[][] = [];

  @Input()
  roundOfSixteenMatches: Match[] = [];

  @Input()
  quarterFinalMatches: Match[] = [];

  @Input()
  semiFinalMatches: Match[] = [];

  @Input()
  finalMatches: Match[] = [];

  @Input()
  groups: Group[] = [];
}
