import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-overlay',
  templateUrl: './loading-overlay.component.html',
  styleUrl: './loading-overlay.component.css',
})
export class LoadingOverlayComponent {
  show = input<boolean>(false);
  label = input<string>('Wird geladen');
  sublabel = input<string>('');
}
