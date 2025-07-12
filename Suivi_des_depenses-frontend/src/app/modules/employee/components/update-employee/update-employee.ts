import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '../../employee-service';
import { Employee } from '../../models/employee.model';
import { Department, Gender } from '../../models/employee.model';
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
  cin!: string;
  isLoading = false;
  errorMessage = '';

  readonly genders = Object.values(Gender);
  readonly departments = Object.values(Department);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cin = this.route.snapshot.paramMap.get('cin')!;
    this.initForm();
    this.loadEmployee();
  }

  initForm(): void {
    this.employeeForm = this.fb.group({
      cin: [{ value: '', disabled: true }],
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      address: ['', Validators.required],
      gender: ['', Validators.required],
      hireDate: ['', Validators.required],
      department: ['', Validators.required],
      occupation: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    // Update occupations dynamically
    this.employeeForm.get('department')?.valueChanges.subscribe(dept => {
      this.occupations = OCCUPATIONS_BY_DEPARTMENT[dept as Department] || [];
      this.employeeForm.get('occupation')?.setValue('');
    });
  }

  loadEmployee(): void {
    this.isLoading = true;
    this.employeeService.getEmployeeByCIN(this.cin).subscribe({
      next: (employee: Employee) => {
        this.employeeForm.patchValue(employee);
        this.occupations = OCCUPATIONS_BY_DEPARTMENT[employee.department as Department] || [];
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load employee.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) return;

    const updatedEmployee: Employee = {
      ...this.employeeForm.getRawValue(), // includes disabled CIN
    };

    this.employeeService.updateEmployee(this.cin, updatedEmployee).subscribe({
      next: () => this.router.navigate(['/employees']),
      error: () => this.errorMessage = 'Update failed. Please try again.'
    });
  }
}
