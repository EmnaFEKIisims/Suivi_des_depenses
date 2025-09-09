import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Client, Continent } from '../../models/client.model';
import { ClientService } from '../../client-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-create-client',
  standalone: true,
  templateUrl: './create-client.html',
  styleUrls: ['./create-client.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [
    // Add required modules for template bindings
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgClass
  ]
})
export class CreateClient implements OnInit {
  client: Client = {
    reference: '',
    name: '',
    contactPerson: '',
    email: '',
    phoneNumber: '',
    address: '',
    continent: Continent.TUNISIA,
    registrationDate: ''
  };

  clientForm: FormGroup;
  continents: string[] = [];
  showSuccessAlert = false;
  showErrorAlert = false;
  errorMessage = '';

  @ViewChild('successAlert') successAlert!: ElementRef;
  @ViewChild('errorAlert') errorAlert!: ElementRef;

  constructor(
    private clientService: ClientService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.clientForm = this.fb.group({
      reference: ['', Validators.required], // changed: removed disabled
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      registrationDate: ['', Validators.required],
      address: ['', Validators.required],
      continent: ['', Validators.required],
      contactPerson: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('^\\+?[0-9\\s-]{7,20}$')]]
    });
  }

  ngOnInit(): void {
    this.loadContinents();
    this.generateReference();
  }

  generateReference(): void {
    this.clientService.generateReference().subscribe({
      next: (ref) => {
        this.client.reference = ref;
        this.clientForm.get('reference')?.setValue(ref);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to generate reference.';
        this.triggerSweetAlert('error', this.errorMessage);
      }
    });
  }

  loadContinents(): void {
    this.clientService.getContinents().subscribe({
      next: (data) => {
        this.continents = data;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load continents.';
        this.triggerSweetAlert('error', this.errorMessage);
      }
    });
  }

  triggerSweetAlert(type: 'success' | 'error', message: string) {
    const swalConfig: SweetAlertOptions = {
      icon: type === 'success' ? 'success' : 'error',
      title: type === 'success' ? 'Success!' : 'Error!',
      text: message,
      showConfirmButton: true,
      timer: type === 'success' ? 3000 : 5000,
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
            titleElement.style.color = type === 'success' ? 'var(--emerald)' : 'var(--ruby)';
            titleElement.style.fontFamily = "'Playfair Display', serif";
            titleElement.style.fontSize = '1.5rem';
          }
        }
      }
    };

    Swal.fire(swalConfig).then(() => {
      if (type === 'success') {
        this.router.navigate(['/clients']);
      }
      this.showSuccessAlert = false;
      this.showErrorAlert = false;
    });
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.triggerSweetAlert('error', 'Please fill all required fields correctly.');
      return;
    }

    this.client = { ...this.client, ...this.clientForm.getRawValue() };
    this.client.registrationDate = new Date().toISOString().split('T')[0];
    this.clientService.createClient(this.client).subscribe({
      next: () => {
        this.triggerSweetAlert('success', 'Client created successfully.');
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to create client. Please try again.';
        this.triggerSweetAlert('error', this.errorMessage);
      }
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}