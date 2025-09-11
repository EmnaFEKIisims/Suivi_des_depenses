import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false
})
export class App {
  protected title = 'Group-IPS';
  currentYear: number = new Date().getFullYear();
  companyName: string = 'Group-IPS';
  scrollPercentage: number = 0;

  constructor(public router: Router) {}

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event: Event) {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    this.scrollPercentage = (winScroll / height) * 100;
  }

  isWelcomePage(): boolean {
    const url = this.router.url.split('?')[0].split('#')[0];
    return url === '/' || url === '/welcome_page';
  }
}
