import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Project } from '../../models/project.model';
import { Employee } from '../../../employee/models/employee.model';
import { ProjectService } from '../../project-service';
import { Router } from '@angular/router';
import { Status, Priority } from '../../models/project.enums';
import { EmployeeService } from '../../../employee/employee-service';
import { ClientService } from '../../../client/client-service';
import { Client } from '../../../client/models/client.model';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { CommonModule, NgClass } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.html',
  styleUrls: ['./create-project.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgClass, NgSelectModule]
})
export class CreateProject implements OnInit {
  projectForm!: FormGroup;
  clients: Client[] = [];
  employees: Employee[] = [];
  reference: string = '';
  showSuccessAlert = false;
  showErrorAlert = false;
  errorMessage = '';
  isSubmitting = false;
  statuses = Object.values(Status);
  priorities = Object.values(Priority);

  @ViewChild('successAlert') successAlert!: ElementRef;
  @ViewChild('errorAlert') errorAlert!: ElementRef;

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
        this.errorMessage = err.error?.message || 'Failed to generate project reference.';
        this.triggerSweetAlert('error', this.errorMessage);
      }
    });
  }

  loadClients(): void {
    this.clientService.getAllClients().subscribe({
      next: (clients) => {
        this.clients = clients;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load clients list.';
        this.triggerSweetAlert('error', this.errorMessage);
      }
    });
  }

  loadActiveEmployees(): void {
    this.employeeService.getEmployeesByStatus('Actif').subscribe({
      next: (employees) => {
        this.employees = employees;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load employees list.';
        this.triggerSweetAlert('error', this.errorMessage);
      }
    });
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
        this.router.navigate(['/projects']);
      }
      this.showSuccessAlert = false;
      this.showErrorAlert = false;
    });
  }

async onSubmit(): Promise<void> {
  if (this.projectForm.invalid || this.isSubmitting) {
    this.projectForm.markAllAsTouched();
    this.markFormGroupTouched(this.projectForm);
    this.triggerSweetAlert('error', 'Please fill all required fields correctly.');
    return;
  }

  this.isSubmitting = true;

  try {
    const formValue = this.projectForm.getRawValue();
    const selectedClient = this.clients.find(c => c.idClient === formValue.client_id);
    if (!selectedClient) throw new Error('Selected client not found');

    // Extract team member references
    const teamMemberReferences = this.team_members.controls
      .map(control => control.value)
      .filter((ref: string | null): ref is string => ref !== null && ref !== '');

    // Convert references to Employee objects (if interface requires Employee[])
    const teamMembersAsEmployees = teamMemberReferences.map(ref => {
      return { reference: ref } as Employee; // Create minimal Employee object
    });

    const project: Project = {
      reference: this.reference,
      name: formValue.name_project,
      description: formValue.description || undefined,
      startDate: this.formatDate(formValue.start_date),
      endDate: this.formatDate(formValue.end_date),
      status: formValue.status,
      budget: formValue.budget ? Number(formValue.budget) : undefined,
      client: selectedClient,
      priority: formValue.priority,
      progress: formValue.progress,
      projectLeader: formValue.project_leader_Reference,
      teamMembers: teamMembersAsEmployees // Use the converted Employee objects
    };

    console.log('Team members being sent:', teamMembersAsEmployees);

    this.projectService.createProject(project).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.triggerSweetAlert('success', 'Project created successfully.');
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to create project.';
        this.triggerSweetAlert('error', this.errorMessage);
        console.error('Error details:', err);
      }
    });
  } catch (error) {
    this.isSubmitting = false;
    this.errorMessage = error instanceof Error ? error.message : 'Failed to prepare project data.';
    this.triggerSweetAlert('error', this.errorMessage);
  }
}

  private formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}