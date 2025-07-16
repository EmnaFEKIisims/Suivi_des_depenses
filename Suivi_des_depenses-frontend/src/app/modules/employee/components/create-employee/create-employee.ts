import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeeService } from '../../employee-service';
import { Gender, Department, Employee } from '../../models/employee.model';
import { OCCUPATIONS_BY_DEPARTMENT } from '../../models/occupations-by-department.ts';

@Component({
  selector: 'app-create-employee',
  standalone: false,
  templateUrl: './create-employee.html',
  styleUrl: './create-employee.scss'
})
export class CreateEmployee implements OnInit {

  employeeForm!: FormGroup;
  genders = Object.values(Gender);
  departments = Object.values(Department);
  occupations: string[] = [];
  isLoading = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.employeeForm = this.fb.group({
      cin: ['', [Validators.required, Validators.minLength(6)]],
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      address: [''],
      gender: ['', Validators.required],
      hireDate: ['', Validators.required],
      department: ['', Validators.required],
      occupation: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.occupations = [];

    // Dynamically update occupations based on department
    this.employeeForm.get('department')?.valueChanges.subscribe((dept: Department) => {
      this.occupations = dept ? OCCUPATIONS_BY_DEPARTMENT[dept] || [] : [];
      this.employeeForm.get('occupation')?.setValue('');
    });
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const newEmployee: Employee = this.employeeForm.value;
    this.isLoading = true;
    this.errorMessage = '';

    this.employeeService.createEmployee(newEmployee).subscribe({
      next: () => {
        alert('✅ Employee created successfully!');
        this.router.navigate(['/employees']);
      },
      error: (err) => {
        console.error('❌ Error creating employee:', err);
        this.errorMessage = 'Failed to create employee. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
