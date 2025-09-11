import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '../../employee-service';
import { Department, Gender, Status } from '../../models/employee.model';
import { OCCUPATIONS_BY_DEPARTMENT } from '../../models/occupations-by-department.ts';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { CommonModule, NgClass } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-update-employee',
  templateUrl: './update-employee.html',
  styleUrls: ['./update-employee.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgClass]
})
export class UpdateEmployee implements OnInit {
  employeeForm!: FormGroup;
  occupations: string[] = [];
  departments = Object.values(Department);
  genders = Object.values(Gender);
  statuses = Object.values(Status);
  showPassword = false;
  showSuccessAlert = false;
  showErrorAlert = false;
  errorMessage = '';
  employeeCin: string = '';

  @ViewChild('successAlert') successAlert!: ElementRef;
  @ViewChild('errorAlert') errorAlert!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    // Get CIN from navigation state, not from route param
    this.employeeCin = history.state.cin || '';
    this.initForm();
    this.loadEmployeeData();
  }

  initForm(): void {
    this.employeeForm = this.fb.group({
      cin: ['', Validators.required], // enabled
      reference: ['', Validators.required], // enabled
      fullName: ['', Validators.required], // enabled
      birthDate: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^\\+?[0-9\\s-]{7,20}$')]],
      address: ['', Validators.required],
      gender: ['', Validators.required],
      hireDate: ['', Validators.required],
      department: ['', Validators.required],
      occupation: ['', Validators.required],
      status: ['', Validators.required],
      exitDate: [''], // always enabled
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.employeeForm.get('department')?.valueChanges.subscribe(dept => {
      const department = dept as Department;
      this.occupations = OCCUPATIONS_BY_DEPARTMENT[department] || [];
      this.employeeForm.get('occupation')?.setValue('');
    });

    this.employeeForm.get('status')?.valueChanges.subscribe(status => {
      this.onStatusChange();
    });
  }

  loadEmployeeData(): void {
    this.employeeService.getEmployeeByCIN(this.employeeCin).subscribe({
      next: (employee) => {
        this.employeeForm.patchValue({
          cin: employee.cin,
          reference: employee.reference,
          fullName: employee.fullName,
          birthDate: this.formatDate(employee.birthDate),
          email: employee.email,
          phoneNumber: employee.phoneNumber,
          address: employee.address,
          gender: employee.gender,
          hireDate: this.formatDate(employee.hireDate),
          department: employee.department,
          occupation: employee.occupation,
          status: employee.status,
          exitDate: employee.exitDate ? this.formatDate(employee.exitDate) : null,
          username: employee.username,
          password: employee.password
        });
        this.occupations = OCCUPATIONS_BY_DEPARTMENT[employee.department as Department] || [];
        this.onStatusChange(); // Ensure exitDate validation is set correctly
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load employee data.';
        this.triggerSweetAlert('error', this.errorMessage);
      }
    });
  }

  private formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }

  onStatusChange(): void {
    const exitDateControl = this.employeeForm.get('exitDate');
    if (this.employeeForm.get('status')?.value === 'Inactif') {
      exitDateControl?.setValidators([Validators.required]);
    } else {
      exitDateControl?.clearValidators();
      exitDateControl?.setValue('');
    }
    exitDateControl?.updateValueAndValidity();
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

    const employeeData = this.employeeForm.getRawValue(); // Use getRawValue to include disabled fields
    if (employeeData.status === 'Actif') {
      employeeData.exitDate = null;
    }

    this.employeeService.updateEmployee(this.employeeCin, employeeData).subscribe({
      next: () => {
        this.triggerSweetAlert('success', 'Employee updated successfully.');
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to update employee. Please try again.';
        this.triggerSweetAlert('error', this.errorMessage);
      }
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}