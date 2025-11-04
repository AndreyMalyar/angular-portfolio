import {Component, inject, signal} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Language } from '../../../core/services/language';
import { Theme } from '../../../core/services/theme';
import { Auth } from '../../../core/services/auth';


interface NavItem {
  name: string;
  link: string;
  linkActive: string;
  linkOptions?: { exact: boolean };
}


@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  languageService = inject(Language);
  themeService = inject(Theme);
  authService = inject(Auth);

  // savedTheme = localStorage.getItem('theme') as ThemeType;


  listNav: NavItem[] = [
    {name: 'nav.home', link: '/home', linkActive: 'active', linkOptions: { exact: true } },
    {name: 'nav.about', link: '/about', linkActive: 'active'},
    {name: 'nav.projects', link: '/projects', linkActive: 'active'},
    {name: 'nav.contact', link: '/contact', linkActive: 'active'},
  ]

  toggleLang() {
    this.languageService.toggleLanguage()
  }

  toggleTheme() {
    this.themeService.toggleTheme()
  }

  toggleRole() {
    this.authService.toggleRole()
  }

}


