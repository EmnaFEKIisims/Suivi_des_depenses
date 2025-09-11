import { Component , HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.html',
  styleUrls: ['./welcome.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class WelcomeComponent {
  isScrolled = false;

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
    alert('Thank you for your message. We will get back to you soon!');
  }
}
