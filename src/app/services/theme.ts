import { Injectable, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

export type ThemeMode = 'system' | 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storageKey = 'smart_travel_theme';

  private readonly modeState = signal<ThemeMode>('system');
  readonly mode = this.modeState.asReadonly();

  private readonly systemDarkQuery =
    window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    void this.initialize();

    this.systemDarkQuery.addEventListener(
      'change',
      () => {
        if (this.modeState() === 'system') {
          this.applyTheme('system');
        }
      }
    );
  }

  async initialize(): Promise<void> {
    const storedTheme = await Preferences.get({
      key: this.storageKey,
    });

    const mode = this.isThemeMode(storedTheme.value)
      ? storedTheme.value
      : 'system';

    this.modeState.set(mode);
    this.applyTheme(mode);
  }

  async setTheme(mode: ThemeMode): Promise<void> {
    this.modeState.set(mode);

    await Preferences.set({
      key: this.storageKey,
      value: mode,
    });

    this.applyTheme(mode);
  }

  private applyTheme(mode: ThemeMode): void {
    const root = document.documentElement;

    root.classList.remove(
      'theme-light',
      'theme-dark'
    );

    const useDarkTheme =
      mode === 'dark' ||
      (
        mode === 'system' &&
        this.systemDarkQuery.matches
      );

    root.classList.add(
      useDarkTheme
        ? 'theme-dark'
        : 'theme-light'
    );
  }

  private isThemeMode(
    value: string | null
  ): value is ThemeMode {
    return (
      value === 'system' ||
      value === 'light' ||
      value === 'dark'
    );
  }
}