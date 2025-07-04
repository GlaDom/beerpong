import { Component, OnInit } from '@angular/core';
import { EnvironmentService } from '../../../services/env/environment.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Router } from '@angular/router';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrl: './callback.component.css',
  imports: [ProgressSpinnerModule]
})
export class CallbackComponent implements OnInit {
  constructor(
    private router: Router) { }

  ngOnInit(): void {
    console.log('callback component hit');
    // TODO: check nach url in storage um richtig weiter zu leiten
    sessionStorage.setItem('redirectUrl', '/home')
    setTimeout(() => {
      this.router.navigate(['/home'], { skipLocationChange: false });
    });
  }
}
