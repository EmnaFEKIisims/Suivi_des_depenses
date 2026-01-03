import { Component , HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AlertService } from '../../shared/services/alert.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.html',
  styleUrls: ['./welcome.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class WelcomeComponent {
  isScrolled = false;

  constructor(private alertService: AlertService) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 10;
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  onSubmitContactForm() {
    // Handle form submission logic here
    console.log('Contact form submitted');
    // You would typically integrate with a backend service here
    this.alertService.showSuccess('Thank you for your message. We will get back to you soon!', 'Message Sent');
  }
}
