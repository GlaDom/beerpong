import { Component, Input, OnInit } from '@angular/core';
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
export class TableViewComponent implements OnInit {
  public matches: Match[] = [];

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

  ngOnInit(): void {
    if (this.regularMatches.length > 0) {
      this.matches = this.regularMatches.flat();
      this.matches = this.sortMatchesByStartTime(this.matches);
    }
  }

  getColor(homePoints: number | undefined, awayPoints: number | undefined, pointType: string): string {
    if (homePoints === undefined || awayPoints === undefined || (homePoints === 0 && awayPoints === 0)) {
      return "";
    }
  
    const isHome = pointType === "home";
    const isWinning = isHome ? homePoints > awayPoints : awayPoints > homePoints;
  
    return isWinning ? "bg-green-400" : "bg-red-400";
  }

  getGroupNameStyle(groupName: string): { [key: string]: string } {
    if (!groupName) {
      return {};
    }

    let styleClass: { [key: string]: string };
    switch(groupName) {
      case "B":
        styleClass = { background: "#8fb2eb", color: "#093375"}; // blau
        break;
      case "C":
        styleClass = { background: "#edcc98", color: "#8f480a"}; // orange
        break;
      case "D":
        styleClass = { background: "#ed9998", color: "#8f0e0a"}; // rot 
        break;
      case "E":
        styleClass = { background: "#e598ed", color: "#7b0a8f" }; // lila
        break;
      case "F":
        styleClass = { background:  "#98ede3", color: "#0a5c8f" }; // tuerkis
        break;
      default: 
        styleClass = {}
        break;
    }
  
    return styleClass;
  }

  /**
 * Sortiert ein Array von Match-Objekten nach start_time in aufsteigender Reihenfolge.
 * Bei gleichen start_time-Werten wird nach group_number sortiert.
 * Matches ohne start_time werden am Ende einsortiert.
 * @param matches Array von Match-Objekten
 * @returns Ein neues sortiertes Array, das Original-Array bleibt unverändert
 */
 private sortMatchesByStartTime(matches: Match[]): Match[] {
    return [...matches].sort((a, b) => {
      // Wenn beide Matches keine start_time haben, sortiere nach group_number
      if (!a.start_time && !b.start_time) {
        return this.compareGroups(a, b);
      }
      
      // Matches ohne start_time kommen ans Ende
      if (!a.start_time) {
        return 1;
      }
      
      if (!b.start_time) {
        return -1;
      }
      
      // Vergleiche start_time
      const timeComparison = new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
      
      // Wenn start_time gleich ist, verwende group_number als sekundäres Sortierkriterium
      if (timeComparison === 0) {
        return this.compareGroups(a, b);
      }
      
      return timeComparison;
    });
  }

  /**
   * Hilfsfunktion zum Vergleichen von group_number
   * Sortiert alphabetisch (A, B, C, ...)
   */
  private compareGroups(a: Match, b: Match): number {
    // Vergleiche group_number lexikographisch
    return a.group_number.localeCompare(b.group_number);
  }
}
