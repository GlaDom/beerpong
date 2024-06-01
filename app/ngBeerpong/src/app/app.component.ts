import { Component, OnInit } from '@angular/core';
import { BeerpongSetupComponent } from './pages/beerpong-setup/beerpong-setup.component'
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { StepsModule } from 'primeng/steps'
import { DividerModule } from 'primeng/divider';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
  providers: [
  ],
  imports: [
    ButtonModule,
    DividerModule,
    BeerpongSetupComponent,
    RouterOutlet
  ]
})
export class AppComponent implements OnInit {
  title = 'SKBeerpong';

  ngOnInit(): void {
    
  }
}
