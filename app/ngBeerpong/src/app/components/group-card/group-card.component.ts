import { Component, Input, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import Group from '../../api/group.interface';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-group-card',
  standalone: true,
  imports: [
    CardModule,
    NgFor
  ],
  templateUrl: './group-card.component.html',
  styleUrl: './group-card.component.css'
})
export class GroupCardComponent implements OnInit {
  @Input()
  group?: Group;

  constructor() {}

  ngOnInit(): void {
    console.log(this.group)
  }
}
