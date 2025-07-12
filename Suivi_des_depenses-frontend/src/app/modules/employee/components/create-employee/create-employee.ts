import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Gender, Department } from '../../models/employee.model';
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

  constructor(private fb: FormBuilder) {}

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

    
    this.employeeForm.get('department')?.valueChanges.subscribe((dept: Department) => {
  this.occupations = dept ? OCCUPATIONS_BY_DEPARTMENT[dept] || [] : [];
  this.employeeForm.get('occupation')?.setValue('');
    });
  }

  onSubmit() {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }
    const newEmployee = this.employeeForm.value;
    console.log('Employee to create:', newEmployee);
    
  }
}
