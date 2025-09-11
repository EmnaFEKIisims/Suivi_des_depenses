import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClientService } from '../../client-service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { CommonModule, NgClass } from '@angular/common';

@Component({
  selector: 'app-update-client',
  templateUrl: './update-client.html',
  styleUrls: ['./update-client.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgClass]
})
export class UpdateClient implements OnInit {
  clientForm!: FormGroup;
  showSuccessAlert = false;
  showErrorAlert = false;
  errorMessage = '';
  continents: string[] = [];
  idClient!: number;

  @ViewChild('successAlert') successAlert!: ElementRef;
  @ViewChild('errorAlert') errorAlert!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.idClient = Number(this.route.snapshot.paramMap.get('idClient'));

    this.clientForm = this.fb.group({
      reference: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      registrationDate: ['', Validators.required],
      address: ['', Validators.required],
      continent: ['', Validators.required],
      contactPerson: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('^\\+?[0-9\\s-]{7,20}$')]] // updated validator
    });

    this.loadContinents();
    this.loadClientData();
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

  loadClientData(): void {
    this.clientService.getClientById(this.idClient).subscribe({
      next: (client) => {
        // Ensure all fields are enabled before patching
        Object.keys(this.clientForm.controls).forEach(key => {
          this.clientForm.get(key)?.enable();
        });
        this.clientForm.patchValue({
          reference: client.reference,
          name: client.name,
          email: client.email,
          registrationDate: this.formatDate(client.registrationDate),
          address: client.address,
          continent: client.continent,
          contactPerson: client.contactPerson,
          phoneNumber: client.phoneNumber
        });
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Impossible de charger les données du client.';
        this.triggerSweetAlert('error', this.errorMessage);
      }
    });
  }

  private formatDate(date: string | Date): string {
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
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

  onUpdate(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      this.triggerSweetAlert('error', 'Please fill all required fields correctly.');
      return;
    }

    const updatedClient = {
      ...this.clientForm.getRawValue()
    };

    this.clientService.updateClient(this.idClient, updatedClient).subscribe({
      next: () => {
        this.triggerSweetAlert('success', 'Client updated successfully.');
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to update client. Please try again.';
        this.triggerSweetAlert('error', this.errorMessage);
      }
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}