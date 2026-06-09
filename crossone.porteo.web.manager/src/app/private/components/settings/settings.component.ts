import { Component } from '@angular/core';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ThemeService, PALETTES, Palette } from 'src/app/core/services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: false,
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  tab: 'profil' | 'preferences' = 'profil';
  palettes = PALETTES;

  constructor(public auth: AuthService, public theme: ThemeService) {}

  get roleLabel(): string { return this.auth.isAdmin ? 'Administrateur' : 'Consultant'; }
  setPalette(p: Palette): void { this.theme.setPalette(p); }
}
