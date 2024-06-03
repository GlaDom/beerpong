import { Component, Input, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { ChipModule } from 'primeng/chip';
import { ButtonModule } from 'primeng/button';
import Match from '../../api/match.interface';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [
    CardModule,
    DividerModule,
    InputNumberModule,
    ChipModule,
    ButtonModule
  ],
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.css'
})
export class GameCardComponent implements OnInit {

  @Input()
  match?: Match

  locked: boolean = false;
  label: 'success' | 'info' | 'warning' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' | null | undefined = "primary";

  constructor() {}

  ngOnInit(): void {
  }

  setLocked(): void {
    this.locked = !this.locked
    if(this.label == 'primary') {
      this.label = 'contrast'
    } else {
      this.label = 'primary'
    }
  }
}
