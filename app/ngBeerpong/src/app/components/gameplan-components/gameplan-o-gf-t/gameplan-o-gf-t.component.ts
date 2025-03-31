import { Component, Input } from '@angular/core';
import { GameplanCardComponent } from '../../gameplan-card/gameplan-card.component';
import { NgFor, NgIf } from '@angular/common';
import Match from '../../../api/match.interface';
import { FieldsetModule } from 'primeng/fieldset';
import { GroupCardComponent } from '../../group-card/group-card.component';
import Group from '../../../api/group.interface';

@Component({
    selector: 'app-gameplan-o-gf-t',
    imports: [
        GameplanCardComponent,
        NgFor,
        FieldsetModule,
        GroupCardComponent,
        NgIf
    ],
    templateUrl: './gameplan-o-gf-t.component.html',
    styleUrl: './gameplan-o-gf-t.component.css'
})
export class GameplanOGfTComponent {
  @Input()
  regularMatches: Match[] = [];

  @Input()
  finalMatches: Match[] = [];

  @Input()
  groups: Group[] = [];
}
