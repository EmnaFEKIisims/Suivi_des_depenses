import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeeService } from '../../employee-service';
import { Gender, Department, Employee , Status } from '../../models/employee.model';
import { OCCUPATIONS_BY_DEPARTMENT } from '../../models/occupations-by-department.ts';


@Component({
  selector: 'app-create-employee',
  standalone: false,
  templateUrl: './create-employee.html',
  styleUrl: './create-employee.scss'
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
  alertMessage = '';

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private employeeService: EmployeeService
  ) { }

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
      phoneNumber: ['', Validators.required],
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
    this.employeeService.generateReference().subscribe(ref => {
      this.reference = ref;
      this.employeeForm.get('reference')?.setValue(ref);
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
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

  onSubmit(): void {
    if (this.employeeForm.valid) {
      const employee = {
        ...this.employeeForm.getRawValue(),
        reference: this.reference,
        status: Status.ACTIF,
        exitDate: null
      };

      this.employeeService.createEmployee(employee).subscribe({
        next: () => {
          this.showSuccessAlert = true;
          setTimeout(() => this.router.navigate(['/employees']), 2000);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to create employee. Please try again.';
        this.showErrorAlert = true;
        setTimeout(() => this.showErrorAlert = false, 5000);
        }
      });
    } else {
      this.employeeForm.markAllAsTouched();
      this.showAlert('Please fill all required fields correctly.', 'error');
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
