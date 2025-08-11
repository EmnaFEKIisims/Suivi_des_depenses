import { Component , OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Client , Continent } from '../../models/client.model'; 
import { ClientService } from '../../client-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-client',
  standalone: false,
  templateUrl: './create-client.html',
  styleUrl: './create-client.scss'
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

  showSuccessAlert: boolean = false;
showErrorAlert: boolean = false;
errorMessage: string = '';
clientForm!: FormGroup;
alertMessage = '';

  continents: string[] = [];

  constructor(
    private clientService: ClientService,
    private router: Router ,
  private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadContinents();
    this.generateReference();
  this.initForm();
  }


  initForm(): void {
  this.clientForm = this.fb.group({
    reference: [{ value: '', disabled: true }],
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    registrationDate: [{ value: '' }],
    address: ['', Validators.required],
    continent: ['', Validators.required],
    contactPerson: ['', Validators.required],
    phoneNumber: ['', Validators.required],
  });
}

  generateReference(): void {
    this.clientService.generateReference().subscribe({
      next: (ref) => {
        this.client.reference = ref;
        this.clientForm.get('reference')?.setValue(ref);
      },
      error: (err) => {
        console.error('Error generating reference:', err);
      }
    });
  }

  loadContinents(): void {
    this.clientService.getContinents().subscribe({
      next: (data) => {
        this.continents = data;
      },
      error: (err) => {
        console.error('Error loading continents:', err);
      }
    });
  }

  createClient(): void {
  this.client.registrationDate = new Date().toISOString().split('T')[0];
  this.clientService.createClient(this.client).subscribe({
    next: () => {
      this.showSuccessAlert = true;
      this.showErrorAlert = false;
      setTimeout(() => this.router.navigate(['/clients']), 2000);
      
    },
    error: (err) => {
      this.showSuccessAlert = false;
      this.showErrorAlert = true;
      this.errorMessage = err.error?.message || 'Failed to create client.';
      setTimeout(() => this.showErrorAlert = false, 5000);
      console.error('Error creating client:', err);
    }
  });
}


onSubmit(): void {
  if (this.clientForm.invalid) return;
  this.client = { ...this.client, ...this.clientForm.getRawValue() };
  this.client.registrationDate = new Date().toISOString().split('T')[0];
  this.createClient();
}


  navigateTo(route: string): void {
    this.router.navigate([route]);
  }


    showAlert(message: string, type: 'success' | 'error'): void {
    this.alertMessage = message;
    if (type === 'success') {
      this.showSuccessAlert = true;
      setTimeout(() => this.showSuccessAlert = false, 3000);
    } else {
      this.showErrorAlert = true;
      setTimeout(() => this.showErrorAlert = false, 3000);
    }
  }


}
