import { Component, Input } from '@angular/core';
import { TableModule } from 'primeng/table';
import Match from '../../api/match.interface';
import { TagModule } from 'primeng/tag';
import { DatePipe, NgIf } from '@angular/common';
import { FieldsetModule } from 'primeng/fieldset';

@Component({
  selector: 'app-table-view',
  standalone: true,
  templateUrl: './table-view.component.html',
  styleUrl: './table-view.component.css',
  imports: [TableModule, TagModule, DatePipe, FieldsetModule, NgIf]
})
export class TableViewComponent {
  @Input()
  matches: Match[] = [];

  @Input()
  roundOfSixteenMatches: Match[] = [];

  @Input()
  quarterFinalMatches: Match[] = [];

  @Input()
  semiFinalMatches: Match[] = [];

  @Input()
  finalMatches: Match[] = [];

  getColor(homePoints: number | undefined, awayPoints: number | undefined, pointType: string): string {
    if (homePoints === undefined || awayPoints === undefined || (homePoints === 0 && awayPoints === 0)) {
      return "";
    }
  
    const isHome = pointType === "home";
    const isWinning = isHome ? homePoints > awayPoints : awayPoints > homePoints;
  
    return isWinning ? "bg-green-400" : "bg-red-400";
  }
}
