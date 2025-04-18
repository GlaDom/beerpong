import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { BeerpongState } from '../../store/beerpong/game.state';
import { Store } from '@ngrx/store';
import { loadGame } from '../../store/beerpong/beerpong.actions';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    standalone: false
})
export class HomeComponent {

  constructor(private beerpongStore: Store<BeerpongState>) {}

  ngOnInit(): void {
    this.beerpongStore.dispatch(loadGame())
  }
}
