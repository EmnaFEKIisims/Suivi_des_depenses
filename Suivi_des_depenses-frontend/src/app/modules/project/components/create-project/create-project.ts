import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Project } from '../../models/project.model';
import { Employee } from '../../../employee/models/employee.model';
import { ProjectService } from '../../project-service';
import { Router } from '@angular/router';
import { ProjectStatus, Priority } from '../../models/project.enums';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from '../../../employee/employee-service';

@Component({
  selector: 'app-create-project',
  standalone: true,
  templateUrl: './create-project.html',
  styleUrls: ['./create-project.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class CreateProjectComponent {
  projectForm: FormGroup;
  priorities = Object.values(Priority);
  statuses = Object.values(ProjectStatus);
  employees: Employee[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private employeeService: EmployeeService, 
    private router: Router
  ) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      clientName: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      status: [ProjectStatus.PLANNED, Validators.required],
      priority: [Priority.MEDIUM, Validators.required],
      budget: [0, [Validators.required, Validators.min(0)]],
      progress: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      description: [''],
      projectLeaderCin: ['', Validators.required],
      teamMembersCins: this.fb.array([this.fb.control('', Validators.required)])
    });

    this.loadEmployees();
  }

  get teamMembersCins(): FormArray {
    return this.projectForm.get('teamMembersCins') as FormArray;
  }

  addTeamMemberControl(): void {
    this.teamMembersCins.push(this.fb.control('', Validators.required));
  }

  removeTeamMemberControl(index: number): void {
    if (this.teamMembersCins.length > 1) {
      this.teamMembersCins.removeAt(index);
    }
  }

  loadEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: data => this.employees = data,
      error: err => {
        console.error('Failed to load employees:', err);
        this.errorMessage = 'Failed to load employee list';
      }
    });
  }

  onSubmit(): void {
    if (this.projectForm.invalid || this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.projectForm.value;
    const project: Project = {
      ...formValue,
      idProject: 0, // Will be assigned by backend
      projectLeader: { cin: formValue.projectLeaderCin } as Employee,
      teamMembers: formValue.teamMembersCins.map((cin: string) => ({ cin } as Employee))
    };

    this.projectService.createProject(project).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/projects']);
      },
      error: (err) => {
        console.error('Error creating project:', err);
        this.errorMessage = 'Failed to create project';
        this.isLoading = false;
      }
    });
  }
}
