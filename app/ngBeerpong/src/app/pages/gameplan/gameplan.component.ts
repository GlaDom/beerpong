import { Component, OnInit } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { GameplanCardComponent } from '../../components/gameplan-card/gameplan-card.component';
import { GroupCardComponent } from '../../components/group-card/group-card.component';

@Component({
  selector: 'app-gameplan',
  standalone: true,
  imports: [
    GameplanCardComponent,
    GroupCardComponent,
    DividerModule
  ],
  templateUrl: './gameplan.component.html',
  styleUrl: './gameplan.component.css'
})
export class GameplanComponent implements OnInit {

  constructor(){}

  ngOnInit(): void {
    
  }


}
