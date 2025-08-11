import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Project } from '../../models/project.model';
import { Employee } from '../../../employee/models/employee.model';
import { ProjectService } from '../../project-service';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientService } from '../../../client/client-service';
import { EmployeeService } from '../../../employee/employee-service';
import { Client } from '../../../client/models/client.model';


@Component({
  selector: 'app-update-project',
  standalone: false,
  templateUrl: './update-project.html',
  styleUrl: './update-project.scss'
})
export class UpdateProject   implements OnInit {

  projectForm!: FormGroup;
  clients: Client[] = [];
  employees: Employee[] = [];
  priorities: string[] = ['LOW', 'MEDIUM', 'HIGH'];
  statuses: string[] = ['PLANNED', 'IN_PROGRESS', 'COMPLETED' , 'ON_HOLD' , 'CANCELLED'];

  showSuccessAlert: boolean = false;
  showErrorAlert: boolean = false;
  alertMessage: string = '';
  errorMessage: string = '';

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
      reference: [{ value: '', disabled: true }],
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      priority: ['', Validators.required],
      status: ['', Validators.required],
      progress: [0],
      startDate: ['', Validators.required],
      endDate: [''],
      client_id: [null, Validators.required],
      budget: [null],
      project_leader_Reference: [null, Validators.required],
      team_members: this.fb.array([])
    });
  }

  get team_members(): FormArray {
    return this.projectForm.get('team_members') as FormArray;
  }

  get teamMemberControls(): FormControl[] {
    return this.team_members.controls as FormControl[];
  }

  loadProject(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    if (id) {
      this.projectService.getProjectById(id).subscribe({
        next: (project: Project) => {
          console.log('Projet reçu:', project);

          // Patch basic fields
          this.projectForm.patchValue({
            reference: project.reference,
            name: project.name,
            description: project.description,
            priority: project.priority,
            status: project.status,
            progress: project.progress,
            startDate: project.startDate,
            endDate: project.endDate,
            client_id: project.client?.idClient,
            budget: project.budget,
            project_leader_Reference: project.projectLeader
          });

          // Clear existing team members form array
          this.team_members.clear();

          // Push each team member reference to the form array as a FormControl
          project.teamMembers?.forEach(memberRef => {
            this.team_members.push(new FormControl(memberRef, Validators.required));
          });
        },
        error: () => {
          this.showError('Unable to load project data.');
        }
      });
    }
  }

  loadClients(): void {
    this.clientService.getAllClients().subscribe({
      next: data => this.clients = data,
      error: () => this.showError('Failed to load clients.')
    });
  }

  loadEmployees(): void {
    this.employeeService.getEmployeesByStatus('Actif').subscribe({
      next: data => this.employees = data,
      error: () => this.showError('Failed to load employees.')
    });
  }

onUpdate(): void {
  if (this.projectForm.invalid) {
    this.projectForm.markAllAsTouched();
    return;
  }

  // Get raw value to include disabled fields like reference
  const rawForm = this.projectForm.getRawValue();

  // Map team_members FormArray values explicitly to match backend expectations
  const updatedProject: any = {
    reference: rawForm.reference,
    name: rawForm.name,
    description: rawForm.description,
    priority: rawForm.priority,
    status: rawForm.status,
    progress: rawForm.progress,
    startDate: rawForm.startDate,
    endDate: rawForm.endDate,
    budget: rawForm.budget,
    client_id: rawForm.client_id,
    project_leader_Reference: rawForm.project_leader_Reference,
    
    // IMPORTANT: match the backend's expected key
    team_members: this.team_members.controls.map(c => c.value)

  };

  console.log('Projet envoyé:', updatedProject);

  const id = +this.route.snapshot.paramMap.get('id')!;
  if (id) {
    this.projectService.updateProject(id, updatedProject).subscribe({
      next: () => {
        this.showSuccess('Project updated successfully.');
        setTimeout(() => this.router.navigate(['/projects']), 2000);
      },
      error: () => this.showError('Failed to update project.')
    });
  }
}


  addTeamMember(): void {
    // Add empty control for new team member
    this.team_members.push(new FormControl(null, Validators.required));
  }

  removeTeamMember(index: number): void {
    this.team_members.removeAt(index);
  }

  showSuccess(message: string): void {
    this.alertMessage = message;
    this.showSuccessAlert = true;
    this.showErrorAlert = false;
    setTimeout(() => this.showSuccessAlert = false, 4000);
  }

  showError(message: string): void {
    this.errorMessage = message;
    this.showErrorAlert = true;
    this.showSuccessAlert = false;
    setTimeout(() => this.showErrorAlert = false, 6000);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}