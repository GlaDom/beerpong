import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { EnvironmentService } from '../../../services/env/environment.service';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrl: './callback.component.css'
})
export class CallbackComponent implements OnInit {
  constructor(private envService: EnvironmentService) {}

  ngOnInit(): void {
    // console.log(this.envService.getAuth());
  }
}
