import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

type RoleType = 'user' | 'admin';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private platformId = inject(PLATFORM_ID);
  private currentRole = signal<RoleType>('user');

  public role = computed(() => this.currentRole())
  public isAdmin = computed(() => this.currentRole() === 'admin');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedRole = localStorage.getItem('role') as RoleType;
      if (savedRole === 'user' || savedRole === 'admin') {
        this.setRole(savedRole)
      }
    }
  }

  setRole(role: RoleType): void {
    this.currentRole.set(role);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('role', role);
    }
  }

  toggleRole(): void {
    const newRole = this.currentRole() === 'user' ? 'admin' : 'user';
    this.setRole(newRole);
  }

  logoOut(): void {
    this.setRole('user')
  }
}
