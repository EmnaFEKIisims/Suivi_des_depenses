import { Component , OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../project-service';
import { Project } from '../../models/project.model';
import { Router } from '@angular/router';




@Component({
  selector: 'app-project-details',
  standalone: false,
  templateUrl: './project-details.html',
  styleUrl: './project-details.scss'
})
export class ProjectDetails implements OnInit {

  projectId!: number;
  project!: Project;
  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.projectId = +this.route.snapshot.paramMap.get('id')!;
    this.getProjectDetails();
  }

  getProjectDetails(): void {
    this.isLoading = true;
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (project) => {
        this.project = project;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching project details:', err);
        this.errorMessage = 'Failed to load project details.';
        this.isLoading = false;
      }
    });
  }

  getProgressColor(): string {
    if (!this.project) return 'bg-secondary';
    if (this.project.progress >= 80) return 'bg-success';
    if (this.project.progress >= 50) return 'bg-warning';
    return 'bg-danger';
  }




}
