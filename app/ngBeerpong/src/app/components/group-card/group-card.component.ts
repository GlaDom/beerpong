import { Component, Input, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import Group from '../../api/group.interface';
import { NgFor, NgIf } from '@angular/common';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-group-card',
  standalone: true,
  imports: [
    CardModule,
    NgFor,
    NgIf,
    TableModule
  ],
  templateUrl: './group-card.component.html',
  styleUrl: './group-card.component.css'
})
export class GroupCardComponent implements OnInit {
  @Input()
  group?: Group;

  constructor() {}

  ngOnInit(): void {
  }
}
