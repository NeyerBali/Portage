import { Component } from '@angular/core';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: false,
  template: '<router-outlet></router-outlet>',
})
export class AppComponent {
  constructor(theme: ThemeService) {
    theme.init();
  }
}
