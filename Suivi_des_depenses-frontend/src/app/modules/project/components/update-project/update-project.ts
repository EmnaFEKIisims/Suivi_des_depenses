import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Project } from '../../models/project.model';
import { Employee } from '../../../employee/models/employee.model';
import { ProjectService } from '../../project-service';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientService } from '../../../client/client-service';
import { EmployeeService } from '../../../employee/employee-service';
import { Client } from '../../../client/models/client.model';
import { Status, Priority } from '../../models/project.enums';
import Swal, { SweetAlertOptions } from 'sweetalert2';

@Component({
  selector: 'app-update-project',
  templateUrl: './update-project.html',
  styleUrls: ['./update-project.scss'],
  encapsulation: ViewEncapsulation.None, // To apply shared styles
  standalone: false // Kept non-standalone for ProjectModule compatibility
})
export class UpdateProject implements OnInit {
  projectForm!: FormGroup;
  clients: Client[] = [];
  employees: Employee[] = [];
  priorities = Object.values(Priority);
  statuses = Object.values(Status);
  showSuccessAlert: boolean = false;
  showErrorAlert: boolean = false;
  errorMessage: string = '';

  @ViewChild('successAlert') successAlert!: ElementRef;
  @ViewChild('errorAlert') errorAlert!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private clientService: ClientService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadProject();
    this.loadClients();
    this.loadEmployees();
  }

  initForm(): void {
    this.projectForm = this.fb.group({
      reference: [{ value: '', disabled: true }, Validators.required],
      name_project: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      priority: ['', Validators.required],
      status: ['', Validators.required],
      progress: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      start_date: ['', Validators.required],
      end_date: [''],
      client_id: [null, Validators.required],
      budget: ['', [Validators.min(0)]],
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

  get teamMemberControls(): FormControl[] {
    return this.team_members.controls as FormControl[];
  }

  loadProject(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    if (id) {
      this.projectService.getProjectById(id).subscribe({
        next: (project: Project) => {
          console.log('Loaded project:', project); // Debug: Log the full project to check teamMembers structure
          this.projectForm.patchValue({
            reference: project.reference,
            name_project: project.name,
            description: project.description,
            priority: project.priority,
            status: project.status,
            progress: project.progress,
            start_date: this.formatDate(project.startDate),
            end_date: project.endDate ? this.formatDate(project.endDate) : null,
            client_id: project.client?.idClient,
            budget: project.budget,
            project_leader_Reference: project.projectLeader // Assuming projectLeader is the full object; use .reference if it's a string
          });

          // Clear and repopulate team_members, handling both full Employee objects and string references
          this.team_members.clear();
          const leaderRef = project.projectLeader?.reference || this.projectForm.get('project_leader_Reference')?.value;
          const teamRefs = project.teamMembers || []; // Fallback to empty array if null

          teamRefs.forEach((member: any) => { // 'any' to handle Employee or string
            let memberRef: string;
            if (typeof member === 'string') {
              memberRef = member.trim();
            } else if (member && typeof member.reference === 'string') {
              memberRef = member.reference.trim();
            } else {
              console.warn('Invalid team member:', member); // Debug: Log invalid members
              return; // Skip invalid
            }

            // Avoid adding leader as team member
            if (memberRef && memberRef !== leaderRef) {
              this.team_members.push(new FormControl(memberRef, Validators.required));
            }
          });

          console.log('Loaded team members refs:', this.team_members.value); // Debug: Log loaded refs
        },
        error: (err) => {
          console.error('Error loading project:', err); // Debug
          this.errorMessage = err.error?.message || 'Unable to load project data.';
          this.triggerSweetAlert('error', this.errorMessage);
        }
      });
    }
  }

  loadClients(): void {
    this.clientService.getAllClients().subscribe({
      next: (data) => {
        this.clients = data;
      },
      error: (err) => {
        console.error('Error loading clients:', err); // Debug
        this.errorMessage = err.error?.message || 'Failed to load clients.';
        this.triggerSweetAlert('error', this.errorMessage);
      }
    });
  }

  loadEmployees(): void {
    this.employeeService.getEmployeesByStatus('Actif').subscribe({
      next: (data) => {
        this.employees = data;
      },
      error: (err) => {
        console.error('Error loading employees:', err); // Debug
        this.errorMessage = err.error?.message || 'Failed to load employees.';
        this.triggerSweetAlert('error', this.errorMessage);
      }
    });
  }

  addTeamMember(): void {
    this.team_members.push(new FormControl<string | null>(null, Validators.required));
  }

  removeTeamMember(index: number): void {
    this.team_members.removeAt(index);
  }

  private formatDate(date: string | Date | undefined): string | null {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null; // Invalid date
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
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

  onUpdate(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      this.markFormGroupTouched(this.projectForm);
      this.triggerSweetAlert('error', 'Please fill all required fields correctly.');
      return;
    }

    const formValue = this.projectForm.getRawValue();
    const leaderRef = formValue.project_leader_Reference?.trim();
    const teamRefs = (formValue.team_members || []).filter((ref: string | null) => ref && ref.trim() !== leaderRef).map((ref: string) => ref.trim());

    const updatedProject: any = {
      reference: formValue.reference,
      name: formValue.name_project,
      description: formValue.description || undefined,
      priority: formValue.priority,
      status: formValue.status,
      progress: formValue.progress,
      startDate: this.formatDate(formValue.start_date),
      endDate: this.formatDate(formValue.end_date),
      client: { idClient: formValue.client_id },
      budget: formValue.budget ? Number(formValue.budget) : undefined,
      projectLeader: leaderRef, // CamelCase, string reference
      teamMembers: teamRefs // Fixed: CamelCase to match backend
    };

    console.log('Updating with payload:', updatedProject); // Debug: Log the payload

    const id = +this.route.snapshot.paramMap.get('id')!;
    if (id) {
      this.projectService.updateProject(id, updatedProject).subscribe({
        next: (response) => {
          console.log('Update response:', response); // Debug
          this.triggerSweetAlert('success', 'Project updated successfully.');
        },
        error: (err) => {
          console.error('Update error:', err); // Debug
          this.errorMessage = err.error?.message || 'Failed to update project.';
          this.triggerSweetAlert('error', this.errorMessage);
        }
      });
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

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}