import { Component , OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators , FormArray ,FormControl  } from '@angular/forms';
import { Project } from '../../models/project.model';
import { Employee } from '../../../employee/models/employee.model';
import { ProjectService } from '../../project-service';
import { Router } from '@angular/router';
import { Status, Priority } from '../../models/project.enums';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from '../../../employee/employee-service';
import { ClientService } from '../../../client/client-service';
import { Client } from '../../../client/models/client.model';
import { NgSelectModule } from '@ng-select/ng-select';


@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.html',
  styleUrls: ['./create-project.scss'],
    standalone: true,  
  imports: [
    
    CommonModule,
    ReactiveFormsModule,
    FormsModule, 
    NgSelectModule,
    
  ]
})
export class CreateProject implements OnInit {
   projectForm!: FormGroup;
  clients: Client[] = [];
  employees: Employee[] = [];
  reference: string = '';
  showSuccessAlert = false;
  showErrorAlert = false;
  errorMessage = '';
  alertMessage = '';
  isSubmitting = false;

  statuses = Object.values(Status);
  priorities = Object.values(Priority);

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private clientService: ClientService,
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadReference();
    this.loadClients();
    this.loadActiveEmployees();
  }

  initForm(): void {
    this.projectForm = this.fb.group({
      reference: [{ value: '', disabled: true }, Validators.required],
      name_project: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      start_date: ['', Validators.required],
      end_date: [''],
      status: [Status.PLANNED, Validators.required],
      budget: ['', [Validators.min(0)]],
      client_id: [null, Validators.required],
      priority: [Priority.MEDIUM, Validators.required],
      progress: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      project_leader_Reference: [null, Validators.required],
      team_members: this.fb.array<FormControl<string | null>>([])
    });

    this.projectForm.get('end_date')?.setValidators([
  Validators.required,
  (control) => {
    const start = this.projectForm?.get('start_date')?.value;
    const end = control.value;
    return start && end && new Date(end) < new Date(start) 
      ? { invalidEndDate: true } 
      : null;
  }
]);

  }

  

  get team_members(): FormArray<FormControl<string | null>> {
    return this.projectForm.get('team_members') as FormArray<FormControl<string | null>>;
  }

  addTeamMember(): void {
    const control = new FormControl<string | null>(null, Validators.required);
    this.team_members.push(control);
  }

  removeTeamMember(index: number): void {
    this.team_members.removeAt(index);
  }

  loadReference(): void {
    this.projectService.generateReference().subscribe({
      next: (ref) => {
        this.reference = ref;
        this.projectForm.get('reference')?.setValue(ref);
      },
      error: (err) => {
        console.error('Failed to generate reference:', err);
        this.showError('Failed to generate project reference');
      }
    });
  }

  loadClients(): void {
    this.clientService.getAllClients().subscribe({
      next: (clients) => {
        this.clients = clients;
      },
      error: (err) => {
        console.error('Failed to load clients:', err);
        this.showError('Failed to load clients list');
      }
    });
  }

  loadActiveEmployees(): void {
    this.employeeService.getEmployeesByStatus('Actif').subscribe({
      next: (employees) => {
        this.employees = employees;
      },
      error: (err) => {
        console.error('Failed to load employees:', err);
        this.showError('Failed to load employees list');
      }
    });
  }

  showError(message: string): void {
    this.errorMessage = message;
    this.showErrorAlert = true;
    setTimeout(() => this.showErrorAlert = false, 5000);
  }

  showSuccess(message: string): void {
    this.alertMessage = message;
    this.showSuccessAlert = true;
    setTimeout(() => this.showSuccessAlert = false, 5000);
  }

  async onSubmit(): Promise<void> {
    if (this.projectForm.invalid || this.isSubmitting) return;
    this.isSubmitting = true;

    try {
      const formValue = this.projectForm.getRawValue();
      
      const selectedClient = this.clients.find(c => c.idClient === formValue.client_id);
      if (!selectedClient) throw new Error('Selected client not found');

      const projectLeader = this.employees.find(e => e.reference === formValue.project_leader_Reference);
      if (!projectLeader) throw new Error('Selected project leader not found');

      const teamMembers = this.employees.filter(e => 
        formValue.team_members.includes(e.reference)
      );

      const project: Project = {
        reference: this.reference,
        name: formValue.name_project,
        description: formValue.description || undefined,
        startDate: new Date(formValue.start_date).toISOString().split('T')[0], 
        endDate: formValue.end_date ? new Date(formValue.end_date).toISOString().split('T')[0] : '', 
        status: formValue.status,
        budget: formValue.budget ? Number(formValue.budget) : undefined,
        client: selectedClient,
        priority: formValue.priority,
        progress: formValue.progress,
        projectLeader: projectLeader,
        teamMembers: teamMembers
      };

      

      this.projectService.createProject(project).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.showSuccess('Project created successfully');
          setTimeout(() => this.router.navigate(['/projects']), 2000);
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('API Error:', err);
          this.showError(err.error?.message || 'Failed to create project');
          setTimeout(() => this.showErrorAlert = false, 5000);
        }
      });

    } catch (error) {
      console.error('Error during project creation:', error);
      this.showError(error instanceof Error ? error.message : 'Failed to prepare project data');
    }
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

}
