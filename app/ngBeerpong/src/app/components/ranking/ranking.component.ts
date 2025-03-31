import { Component, Input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import Team from '../../api/team.interface';

@Component({
    selector: 'app-ranking',
    imports: [
        CardModule,
        TableModule,
        ButtonModule,
        ConfirmPopupModule
    ],
    templateUrl: './ranking.component.html',
    styleUrl: './ranking.component.css'
})
export class RankingComponent {
  @Input()
  teams: Team[] = [];

  constructor() {}
}
