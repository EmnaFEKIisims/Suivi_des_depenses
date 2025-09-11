import { Component , OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../project-service';
import { Project } from '../../models/project.model';
import { Router } from '@angular/router';
import { EmployeeService } from '../../../employee/employee-service';
import { Employee } from '../../../employee/models/employee.model';
import { forkJoin } from 'rxjs';




@Component({
  selector: 'app-project-details',
  standalone: false,
  templateUrl: './project-details.html',
  styleUrls: ['../../../../shared/styles/executive-details-template.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProjectDetails  implements OnInit {
  project: Project | null = null;
  isLoading = true;
  errorMessage = '';
  teamMembers: Employee[] = [];
  projectLeader: Employee | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.loadProjectDetails();
  }

  loadProjectDetails(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'No project ID provided';
      this.isLoading = false;
      return;
    }

    this.projectService.getProjectById(+id).subscribe({
      next: (project) => {
        this.project = project;
        this.isLoading = false;
        // Load additional data after basic project is loaded
        if (project) {
          this.loadProjectLeader();
          this.loadTeamMembers();
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load project details: ' + (err.message || 'Unknown error');
        this.isLoading = false;
        console.error('Error loading project:', err);
      }
    });
  }

  loadProjectLeader(): void {
    if (!this.project || !this.project.projectLeader) return;

    try {
      const leaderRef = typeof this.project.projectLeader === 'string' 
        ? this.project.projectLeader 
        : this.project.projectLeader.reference;

      this.employeeService.getEmployeeByReference(leaderRef).subscribe({
        next: (employee) => {
          this.projectLeader = employee;
        },
        error: (err) => {
          console.warn('Could not load project leader:', err);
          // Create a minimal employee object for display
          this.projectLeader = null;
        }
      });
    } catch (error) {
      console.warn('Error processing project leader:', error);
    }
  }

loadTeamMembers(): void {
  if (!this.project || !this.project.teamMembers) {
    this.teamMembers = [];
    return;
  }

  try {
    // Clear existing members
    this.teamMembers = [];

    // Create an array of observables for all team members
    const memberObservables = this.project.teamMembers.map(member => {
      const memberRef = typeof member === 'string' ? member : member.reference;
      return this.employeeService.getEmployeeByReference(memberRef);
    });

    // Process all members at once
    forkJoin(memberObservables).subscribe({
      next: (employees: Employee[]) => {
        this.teamMembers = employees || [];
        console.log('Loaded team members:', this.teamMembers.length);
      },
      error: (err) => {
        console.warn('Could not load all team members:', err);
        // Don't fail silently, just set empty array
        this.teamMembers = [];
      }
    });
  } catch (error) {
    console.warn('Error processing team members:', error);
    this.teamMembers = [];
  }
}

getMemberDisplay(member: Employee): string {
  if (!member) return 'Unknown';
  return member.fullName || member.reference || 'Unknown';
}




  
getProjectLeaderName(project: Project | null): string {
  if (!project || !project.projectLeader) return 'Not assigned';
  
  if (typeof project.projectLeader === 'string') {
    // Fetch employee details if leader is a reference string
    this.employeeService.getEmployeeByReference(project.projectLeader).subscribe({
      next: (employee) => {
        project.projectLeader = employee;
      },
      error: () => {
        // Keep the reference if fetch fails
        console.error('Failed to fetch leader details');
      }
    });
    return project.projectLeader; // Return reference temporarily
  }
  return project.projectLeader.fullName || project.projectLeader.reference;
}



  navigateToEdit(): void {
    if (this.project) {
      this.router.navigate(['/projects/edit', this.project.idProject]);
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}