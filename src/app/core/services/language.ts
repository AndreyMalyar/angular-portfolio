import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

type LanguageType = 'ru' | 'en';
interface Translations {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class Language {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID)
  private currentLang = signal<LanguageType>("ru");
  private translations = signal<Translations>({})

  // Публичные computed signals
  public lang = computed(() => this.currentLang());
  public t = computed(() => this.translations());

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedLang = localStorage.getItem('language') as LanguageType;
      if(savedLang === 'ru' || savedLang === 'en') {
        this.setLanguage(savedLang)
      } else {
        this.loadTranslations('ru')
      }
    } else {
      this.loadTranslations('ru')
    }

  }

  setLanguage(lang: LanguageType): void {
    this.currentLang.set(lang);

    if(isPlatformBrowser(this.platformId)) {
      localStorage.setItem('language', lang);
    }

    this.loadTranslations(lang)
  }

  // Загрузка переводов из JSON
  private loadTranslations(lang: LanguageType): void {
    this.http.get<Translations>(`http://localhost:4200/assets/i18n/${lang}.json`)
      .subscribe({
        next: (data) => {
          this.translations.set(data)
        },
        error: (err) => {
          console.error('❌ Ошибка загрузки переводов:', err)
        }
      })
  }

  toggleLanguage(): void {
    const newLang = this.currentLang() === 'ru' ? 'en' : 'ru';
    this.setLanguage(newLang);
  }

  // Получить перевод по ключу (например, "nav.home")
  translate(key: string): string {
    const keys = key.split('.');
    let value: any = this.translations()

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  }
}
