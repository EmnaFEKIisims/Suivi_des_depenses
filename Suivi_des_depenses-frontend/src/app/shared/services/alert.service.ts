import { Injectable } from '@angular/core';
import Swal, { SweetAlertOptions } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  /**
   * Show a styled SweetAlert2 alert
   */
  showAlert(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string, timer?: number) {
    const swalConfig: SweetAlertOptions = {
      icon: type,
      title: title,
      text: message,
      showConfirmButton: true,
      timer: timer || (type === 'success' ? 3000 : 5000),
      willOpen: () => {
        const popup = Swal.getPopup();
        if (popup) {
          const popupElement = popup as HTMLElement;
          popupElement.style.background = 'var(--bg-glass)';
          popupElement.style.border = 'var(--border-whisper)';
          popupElement.style.borderRadius = 'var(--radius-xl)';
          popupElement.style.backdropFilter = 'blur(16px)';
          popupElement.style.boxShadow = 'var(--shadow-medium)';
          
          const title = document.querySelector('.swal2-title');
          if (title) {
            const titleElement = title as HTMLElement;
            titleElement.style.color = this.getColorForType(type);
            titleElement.style.fontWeight = '600';
          }
          
          const content = document.querySelector('.swal2-html-container');
          if (content) {
            const contentElement = content as HTMLElement;
            contentElement.style.color = 'var(--text-primary)';
          }
        }
      }
    };

    Swal.fire(swalConfig);
  }

  /**
   * Show an access denied alert
   */
  showAccessDenied(message: string = 'You do not have permission to access this resource.') {
    this.showAlert('error', 'Access Denied', message, 4000);
  }

  /**
   * Show a success alert
   */
  showSuccess(message: string, title: string = 'Success!') {
    this.showAlert('success', title, message);
  }

  /**
   * Show an error alert
   */
  showError(message: string, title: string = 'Error!') {
    this.showAlert('error', title, message);
  }

  /**
   * Show a warning alert
   */
  showWarning(message: string, title: string = 'Warning!') {
    this.showAlert('warning', title, message);
  }

  /**
   * Show an info alert
   */
  showInfo(message: string, title: string = 'Information') {
    this.showAlert('info', title, message);
  }

  /**
   * Get the color for each alert type
   */
  private getColorForType(type: string): string {
    switch (type) {
      case 'success':
        return 'var(--emerald)';
      case 'error':
        return 'var(--ruby)';
      case 'warning':
        return 'var(--amber)';
      case 'info':
        return 'var(--sky)';
      default:
        return 'var(--text-primary)';
    }
  }
}
