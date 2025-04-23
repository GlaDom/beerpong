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
    // = {
    //   "A": "bg-blue-400",
    //   "B": "bg-green-400",
    //   "C": "bg-yellow-400",
    //   "D": "bg-red-400",
    //   "E": "bg-purple-400",
    //   "F": "bg-pink-400",
    //   "G": "bg-orange-400",
    //   "H": "bg-teal-400"
    // };
  
    return styleClass;
  }
}
