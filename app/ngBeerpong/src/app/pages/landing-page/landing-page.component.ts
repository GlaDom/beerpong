import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { TabMenuModule } from 'primeng/tabmenu';

@Component({
    selector: 'app-landing-page',
    templateUrl: './landing-page.component.html',
    styleUrl: './landing-page.component.css',
    imports: [
        ButtonModule,
        MenubarModule
    ]
})
export class LandingPageComponent implements OnInit {
  public items: MenuItem[];

  constructor(
    private router: Router,
  ) {}

  ngOnInit(): void {
    
  }

  login(): void {
    this.router.navigate(['/home']);
  }
}
