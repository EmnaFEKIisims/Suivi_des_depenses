import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '../../employee-service';
import { Employee } from '../../models/employee.model';
import { Department, Gender , Status } from '../../models/employee.model';
import { OCCUPATIONS_BY_DEPARTMENT } from '../../models/occupations-by-department.ts';

@Component({
  selector: 'app-update-employee',
  standalone: false ,
  templateUrl: './update-employee.html',
  styleUrl: './update-employee.scss'
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
  alertMessage = '';
  employeeCin: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService
  ) { }

  ngOnInit(): void {
    this.employeeCin = this.route.snapshot.paramMap.get('CIN') || '';
    this.initForm();
    this.loadEmployeeData();
  }

  initForm(): void {
    this.employeeForm = this.fb.group({
      cin: ['', Validators.required],
      reference: ['', Validators.required],
      fullName: ['', Validators.required],
      birthDate: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      address: ['', Validators.required],
      gender: ['', Validators.required],
      hireDate: ['', Validators.required],
      department: ['', Validators.required],
      occupation: ['', Validators.required],
      status: ['', Validators.required],
      exitDate: [''],
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.employeeForm.get('department')?.valueChanges.subscribe(dept => {
      const department = dept as Department;
      this.occupations = OCCUPATIONS_BY_DEPARTMENT[department] || [];
      this.employeeForm.get('occupation')?.setValue('');
    });
  }

  loadEmployeeData(): void {
    this.employeeService.getEmployeeByCIN(this.employeeCin).subscribe({
      next: (employee) => {
        this.employeeForm.patchValue(employee);
        this.occupations = OCCUPATIONS_BY_DEPARTMENT[employee.department as Department] || [];
      },
      error: (err) => {
        console.error('Error loading employee data:', err);
        this.showAlert('Failed to load employee data', 'error');
      }
    });
  }

  onStatusChange(): void {
    if (this.employeeForm.get('status')?.value === 'Inactif') {
      this.employeeForm.get('exitDate')?.setValidators([Validators.required]);
    } else {
      this.employeeForm.get('exitDate')?.clearValidators();
      this.employeeForm.get('exitDate')?.setValue(null);
    }
    this.employeeForm.get('exitDate')?.updateValueAndValidity();
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
      const employeeData = this.employeeForm.value;
      // If status is Actif, set exitDate to null
      if (employeeData.status === 'Actif') {
        employeeData.exitDate = null;
      }

      this.employeeService.updateEmployee(this.employeeCin, employeeData).subscribe({
        next: () => {
          this.showAlert('Employee updated successfully!', 'success');
          setTimeout(() => this.router.navigate(['/employees']), 2000);
        },
        error: (err) => {
          console.error('Error updating employee:', err);
          this.showAlert('Failed to update employee', 'error');
        }
      });
    } else {
      this.employeeForm.markAllAsTouched();
      this.showAlert('Please fill all required fields correctly', 'error');
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
