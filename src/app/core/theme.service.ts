import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'app-theme';
  private _theme$ = new BehaviorSubject<ThemeMode>(this.getInitialTheme());
  theme$ = this._theme$.asObservable();

  constructor() {
    this.applyTheme(this._theme$.value);
  }

  toggleTheme() {
    const next: ThemeMode = this._theme$.value === 'light' ? 'dark' : 'light';
    this.setTheme(next);
  }

  setTheme(theme: ThemeMode) {
    if (this._theme$.value === theme) return;
    this._theme$.next(theme);
    this.applyTheme(theme);
  }

  getTheme(): ThemeMode {
    return this._theme$.value;
  }

  private getInitialTheme(): ThemeMode {
    const stored = localStorage.getItem(this.storageKey) as ThemeMode | null;
    if (stored === 'light' || stored === 'dark') return stored;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  private applyTheme(theme: ThemeMode) {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem(this.storageKey, theme);
  }
}
