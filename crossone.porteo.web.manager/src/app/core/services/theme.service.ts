import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark';
export type Palette = 'emerald' | 'gold' | 'azur' | 'violet' | 'coral';

const THEME_KEY = 'porteo-theme';
const PALETTE_KEY = 'porteo-palette';

export const PALETTES: { value: Palette; label: string; swatch: string }[] = [
  { value: 'emerald', label: 'Émeraude', swatch: '#0E5C4A' },
  { value: 'gold', label: 'Or', swatch: '#A4760F' },
  { value: 'azur', label: 'Bleu ciel', swatch: '#134A8C' },
  { value: 'violet', label: 'Améthyste', swatch: '#46199A' },
  { value: 'coral', label: 'Corail', swatch: '#88271A' },
];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _theme$ = new BehaviorSubject<ThemeMode>(this.readTheme());
  private _palette$ = new BehaviorSubject<Palette>(this.readPalette());
  theme$ = this._theme$.asObservable();
  palette$ = this._palette$.asObservable();

  get theme(): ThemeMode { return this._theme$.value; }
  get palette(): Palette { return this._palette$.value; }

  init(): void {
    this.applyTheme(this.theme);
    this.applyPalette(this.palette);
  }

  toggleTheme(): void {
    this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
  }

  setTheme(mode: ThemeMode): void {
    localStorage.setItem(THEME_KEY, mode);
    this._theme$.next(mode);
    this.applyTheme(mode);
  }

  setPalette(palette: Palette): void {
    localStorage.setItem(PALETTE_KEY, palette);
    this._palette$.next(palette);
    this.applyPalette(palette);
  }

  private applyTheme(mode: ThemeMode): void {
    document.documentElement.setAttribute('data-theme', mode);
  }

  private applyPalette(palette: Palette): void {
    if (palette === 'emerald') document.documentElement.removeAttribute('data-palette');
    else document.documentElement.setAttribute('data-palette', palette);
  }

  private readTheme(): ThemeMode {
    return (localStorage.getItem(THEME_KEY) as ThemeMode) || 'light';
  }

  private readPalette(): Palette {
    // Palette par défaut = azur (bleu ciel + jaune), identité visuelle Portéo.
    return (localStorage.getItem(PALETTE_KEY) as Palette) || 'azur';
  }
}
