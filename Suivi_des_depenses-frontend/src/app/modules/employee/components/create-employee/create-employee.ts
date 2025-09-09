import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeeService } from '../../employee-service';
import { Gender, Department, Employee, Status } from '../../models/employee.model';
import { OCCUPATIONS_BY_DEPARTMENT } from '../../models/occupations-by-department.ts';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { CommonModule, NgClass } from '@angular/common';

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.html',
  styleUrls: ['./create-employee.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgClass]
})
export class CreateEmployee implements OnInit {
  employeeForm!: FormGroup;
  occupations: string[] = [];
  departments = Object.values(Department);
  genders = Object.values(Gender);
  statuses = Object.values(Status);
  reference: string = '';
  showPassword = false;
  showSuccessAlert = false;
  showErrorAlert = false;
  errorMessage = '';

  @ViewChild('successAlert') successAlert!: ElementRef;
  @ViewChild('errorAlert') errorAlert!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadReference();
  }

  initForm(): void {
    this.employeeForm = this.fb.group({
      cin: ['', Validators.required],
      reference: [{ value: '', disabled: true }, Validators.required],
      fullName: ['', Validators.required],
      birthDate: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^\\+?[0-9\\s-]{7,20}$')]],
      address: ['', Validators.required],
      gender: ['', Validators.required],
      hireDate: ['', Validators.required],
      department: ['', Validators.required],
      occupation: ['', Validators.required],
      status: [{ value: Status.ACTIF, disabled: true }, Validators.required],
      exitDate: [{ value: null, disabled: true }],
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.employeeForm.get('department')?.valueChanges.subscribe(dept => {
      const department = dept as Department;
      this.occupations = OCCUPATIONS_BY_DEPARTMENT[department] || [];
      this.employeeForm.get('occupation')?.setValue('');
    });
  }

  loadReference(): void {
    this.employeeService.generateReference().subscribe({
      next: (ref) => {
        this.reference = ref;
        this.employeeForm.get('reference')?.setValue(ref);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to generate reference.';
        this.triggerSweetAlert('error', this.errorMessage);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
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
        this.router.navigate(['/employees']);
      }
      this.showSuccessAlert = false;
      this.showErrorAlert = false;
    });
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      this.triggerSweetAlert('error', 'Please fill all required fields correctly.');
      return;
    }

    const employee = {
      ...this.employeeForm.getRawValue(),
      reference: this.reference,
      status: Status.ACTIF,
      exitDate: null
    };

    this.employeeService.createEmployee(employee).subscribe({
      next: () => {
        this.triggerSweetAlert('success', 'Employee created successfully.');
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to create employee. Please try again.';
        this.triggerSweetAlert('error', this.errorMessage);
      }
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}