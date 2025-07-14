import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Project } from '../../models/project.model';
import { Employee } from '../../../employee/models/employee.model';
import { ProjectService } from '../../project-service';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectStatus, Priority } from '../../models/project.enums';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../../employee/employee-service';

@Component({
  selector: 'app-update-project',
  standalone: false,
  templateUrl: './update-project.html',
  styleUrl: './update-project.scss'
})
export class UpdateProject implements OnInit {
  projectForm: FormGroup;
  priorities = Object.values(Priority);
  statuses = Object.values(ProjectStatus);
  employees: Employee[] = [];
  isLoading = false;
  errorMessage = '';
  projectId!: number;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private employeeService: EmployeeService,
    public router: Router, // Changed to public for template access
    private route: ActivatedRoute
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
  }

  ngOnInit(): void {
    this.projectId = +this.route.snapshot.paramMap.get('id')!;
    this.loadEmployees();
    this.loadProject();
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

  loadProject(): void {
    this.isLoading = true;
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (project) => {
        this.populateForm(project);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load project:', err);
        this.errorMessage = 'Failed to load project details';
        this.isLoading = false;
      }
    });
  }

  populateForm(project: Project): void {
    // Clear existing team members
    while (this.teamMembersCins.length) {
      this.teamMembersCins.removeAt(0);
    }

    // Add team member controls for each team member
    project.teamMembers?.forEach(member => {
      this.teamMembersCins.push(this.fb.control(member.cin, Validators.required));
    });

    // If no team members, add one empty control
    if (project.teamMembers?.length === 0) {
      this.addTeamMemberControl();
    }

    this.projectForm.patchValue({
      name: project.name,
      clientName: project.clientName,
      startDate: project.startDate ? new Date(project.startDate).toISOString().substring(0, 10) : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().substring(0, 10) : '',
      status: project.status,
      priority: project.priority,
      budget: project.budget,
      progress: project.progress,
      description: project.description,
      projectLeaderCin: project.projectLeader?.cin
    });
  }

  onSubmit(): void {
    if (this.projectForm.invalid || this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.projectForm.value;
    const project: Project = {
      ...formValue,
      idProject: this.projectId,
      projectLeader: { cin: formValue.projectLeaderCin } as Employee,
      teamMembers: formValue.teamMembersCins.map((cin: string) => ({ cin } as Employee))
    };

    this.projectService.updateProject(this.projectId, project).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/projects']);
      },
      error: (err) => {
        console.error('Error updating project:', err);
        this.errorMessage = 'Failed to update project';
        this.isLoading = false;
      }
    });
  }
}
