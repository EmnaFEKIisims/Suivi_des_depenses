import { Component , OnInit } from '@angular/core';
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
  styleUrl: './project-details.scss'
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
        this.loadProjectLeader();
        this.loadTeamMembers();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load project details';
        this.isLoading = false;
        console.error('Error loading project:', err);
      }
    });
  }

  loadProjectLeader(): void {
    if (!this.project || !this.project.projectLeader) return;

    const leaderRef = typeof this.project.projectLeader === 'string' 
      ? this.project.projectLeader 
      : this.project.projectLeader.reference;

    this.employeeService.getEmployeeByReference(leaderRef).subscribe({
      next: (employee) => {
        this.projectLeader = employee;
      },
      error: () => {
        this.projectLeader = { 
          reference: leaderRef, 
          fullName: leaderRef 
        } as Employee;
      }
    });
  }

loadTeamMembers(): void {
  if (!this.project || !this.project.teamMembers) return;

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
      this.teamMembers = employees;
      console.log('Processed team members with full names:', 
        this.teamMembers.map(m => ({ref: m.reference, name: m.fullName})));
    },
    error: () => {
      // Fallback to references if any request fails
      this.teamMembers = this.project!.teamMembers.map(member => {
        const memberRef = typeof member === 'string' ? member : member.reference;
        return { reference: memberRef, fullName: memberRef } as Employee;
      });
    }
  });
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