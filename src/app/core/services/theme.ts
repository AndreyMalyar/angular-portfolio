import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

type ThemeType = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class Theme {
  private platformId = inject(PLATFORM_ID);
  private currentTheme = signal<ThemeType>('light')

  public theme = computed(() => this.currentTheme());

  constructor() {
    if (isPlatformBrowser(this.platformId)){
      const savedTheme = localStorage.getItem('theme') as ThemeType;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        this.setTheme(savedTheme)
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        this.setTheme(prefersDark ? 'dark' : 'light');
      }
    }
  }

  setTheme(theme: ThemeType): void {
    this.currentTheme.set(theme);

    if(isPlatformBrowser(this.platformId)){
      localStorage.setItem('theme', theme);
    }

    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

}
