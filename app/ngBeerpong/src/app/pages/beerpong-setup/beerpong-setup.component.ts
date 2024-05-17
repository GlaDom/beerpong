import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { StepsModule } from 'primeng/steps';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { FormArray, FormBuilder, FormControl, FormGroup, RequiredValidator, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-beerpong-setup',
  templateUrl: './beerpong-setup.component.html',
  styleUrl: './beerpong-setup.component.css',
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    StepsModule,
    ToggleButtonModule,
    NgIf,
    NgFor,
    InputTextModule,
    DividerModule,
    ReactiveFormsModule
  ]
})
export class BeerpongSetupComponent implements OnInit {
  items: MenuItem[] =[];
  activeIndex: number = 0;
  GAMEMODE_30_TEAMS: string = '6 Gruppen je 5 Teams';
  gameForm: FormGroup;
  groupNames: string[] = ["A", "B", "C", "D", "E", "F"]
  teamsSet: boolean = false

  constructor(private fb: FormBuilder) {
    this.gameForm = this.fb.group({
      groups: this.fb.array([])
    })

    for(let i=0;i<=5;i++) {
      let groupForm = this.fb.group({
        name: new FormControl(this.groupNames[i]),
        team1: new FormControl('', [Validators.required, Validators.minLength(3)]),
        team2: new FormControl('', [Validators.required, Validators.minLength(3)]),
        team3: new FormControl('', [Validators.required, Validators.minLength(3)]),
        team4: new FormControl('', [Validators.required, Validators.minLength(3)]),
        team5: new FormControl('', [Validators.required, Validators.minLength(3)])
      })

      this.groups.push(groupForm)
    }
  }
    
  ngOnInit(): void {
    this.items = [
      {
        label: 'Spielmodus'
      },
      {
        label: 'Mannschaften'
      },
      {
        label: 'Spieluebersicht'
      }
    ]
  }

  onActiveIndexChange(event: any): void {
    console.log(this.groups)
    this.teamsSet = true
    this.activeIndex=event
  }

  get groups() {
    return this.gameForm.controls["groups"] as FormArray;
  }


}
