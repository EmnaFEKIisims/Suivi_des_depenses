import { Component , OnInit, ViewEncapsulation} from '@angular/core';
import { ProjectService } from '../../project-service';
import { Project } from '../../models/project.model';
import { Status, Priority } from '../../models/project.enums';
import { Router } from '@angular/router';
import { EmployeeService } from '../../../employee/employee-service';
declare const bootstrap: any;


@Component({
  selector: 'app-project-list',
  standalone: false,
  templateUrl: './project-list.html',
  styleUrls: [
    '../../../../shared/styles/executive-list-template.scss',
    './project-list.scss'
  ],
  encapsulation: ViewEncapsulation.None
})
export class ProjectList implements OnInit {

  projects: Project[] = [];
  filteredProjects: Project[] = [];

  statuses: string[] = Object.values(Status);
  selectedStatus: string = 'IN_PROGRESS';
  searchTerm: string = '';

  constructor(private projectService: ProjectService,
    private employeeService: EmployeeService,
     private router: Router) { }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectService.getAllProjects().subscribe((data) => {
      this.projects = data;
      this.applyFilters();
    });
  }

  formatStatus(status: string): string {
  // Convert enum value to display-friendly format
  return status
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

  applyFilters(): void {
    this.filteredProjects = this.projects.filter(project => {
      const matchesStatus =
        this.selectedStatus === 'ALL' || !this.selectedStatus || project.status === this.selectedStatus;

      const searchLower = this.searchTerm.toLowerCase();
      const matchesSearch =
        !this.searchTerm ||
        project.name.toLowerCase().includes(searchLower) ||
        project.client?.name.toLowerCase().includes(searchLower) ||
        this.getProjectLeaderName(project).toLowerCase().includes(searchLower);

      return matchesStatus && matchesSearch;
    });
  }

getProjectLeaderName(project: Project): string {
    if (typeof project.projectLeader === 'string') {
      // If it's a reference string, fetch the employee details
      this.employeeService.getEmployeeByReference(project.projectLeader).subscribe({
        next: (employee) => {
          // Update the project object with the fetched employee
          project.projectLeader = employee;
        },
        error: () => {
          return project.projectLeader; // Return reference if fetch fails
        }
      });
      return project.projectLeader; // Temporary return of reference
    }
    return project.projectLeader?.fullName || '';
  }

  getTeamMemberNames(teamMembers: any[]): string {
    if (teamMembers.length === 0) return 'No team members';
    
    if (typeof teamMembers[0] === 'string') {
      // If members are references, just display the references
      return teamMembers.join(', ');
    }
    // If members are full objects, display names
    return teamMembers.map(m => m.fullName).join(', ');
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  goToCreateProject(): void {
    this.router.navigate(['/add-project']);
  }

  goToEditProject(id: number): void {
    this.router.navigate(['/projects/edit', id]);
  }

  goToProjectDetails(id: number): void {
    this.router.navigate(['/projects', id]);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }



}
