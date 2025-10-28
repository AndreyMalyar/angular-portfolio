import {Component, inject} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Language } from '../../../core/services/language';

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

  listNav: NavItem[] = [
    {name: 'nav.home', link: '/home', linkActive: 'active', linkOptions: { exact: true } },
    {name: 'nav.about', link: '/about', linkActive: 'active'},
    {name: 'nav.projects', link: '/projects', linkActive: 'active'},
    {name: 'nav.contact', link: '/contact', linkActive: 'active'},
  ]

  toggleLang() {
    this.languageService.toggleLanguage()
  }

}
