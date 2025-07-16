import { Component , OnInit} from '@angular/core';
import { ProjectService } from '../../project-service';
import { Project } from '../../models/project.model';
import { ProjectStatus, Priority } from '../../models/project.enums';
import { Router } from '@angular/router';
declare const bootstrap: any;


@Component({
  selector: 'app-project-list',
  standalone: false,
  templateUrl: './project-list.html',
  styleUrl: './project-list.scss'
})
export class ProjectList implements OnInit {
  projects: Project[] = [];
   isLoading = false;     
  errorMessage = '';
  selectedProjectId: number | null = null;

  statuses = ProjectStatus;
  priorities = Priority;

  constructor(
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectService.getAllProjects().subscribe({
      next: (data) => this.projects = data,
      error: () => alert('Failed to load projects.')
    });
  }

  openDeleteModal(projectId: number): void {
    this.selectedProjectId = projectId;
    const modalElement = document.getElementById('confirmDeleteModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmDelete(): void {
    if (this.selectedProjectId === null) return;

    this.projectService.deleteProject(this.selectedProjectId).subscribe({
      next: () => {
        this.projects = this.projects.filter(p => p.idProject !== this.selectedProjectId);
        this.selectedProjectId = null;

        const modalElement = document.getElementById('confirmDeleteModal');
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement);
          modal?.hide();
        }
      },
      error: () => {
        alert('Failed to delete project.');
      }
    });
  }

  editProject(id: number): void {
    this.router.navigate(['/projects/edit', id]);
  }



  viewDetails(project: Project): void {
  this.router.navigate(['/projects', project.idProject]);
}




}
