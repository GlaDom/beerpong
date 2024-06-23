import { Component, Input } from '@angular/core';
import Match from '../../../api/match.interface';
import { GameCardComponent } from '../../game-card/game-card.component';
import { TabViewModule } from 'primeng/tabview';
import { NgFor } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';

@Component({
  selector: 'app-mode-o-gf-t',
  standalone: true,
  imports: [
    GameCardComponent,
    TabViewModule,
    NgFor,
    ButtonModule,
    FieldsetModule
  ],
  templateUrl: './mode-o-gf-t.component.html',
  styleUrl: './mode-o-gf-t.component.css'
})
export class ModeOGfTComponent {
  @Input()
  regularMatches: Match[] = [];

  @Input()
  finalMatches: Match[] = [];

  constructor() {}

  updateFinal(): void {}
}
