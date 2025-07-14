import { Injectable } from '@angular/core';
import { Project } from './models/project.model';
import { Observable , throwError } from 'rxjs';
import { HttpClient , HttpParams , HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

 private baseUrl = 'http://localhost:8080/api/projects';

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error.message);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }

  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.baseUrl)
      .pipe(catchError(this.handleError));
  }

  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/getProjectById/${id}`)
      .pipe(catchError(this.handleError));
  }

  createProject(project: Project): Observable<Project> {
    const requestBody = {
      ...project,
      projectLeader: { cin: project.projectLeader?.cin },
      teamMembers: project.teamMembers?.map(member => ({ cin: member.cin })) || []
    };
    
    return this.http.post<Project>(`${this.baseUrl}/createProject`, requestBody)
      .pipe(catchError(this.handleError));
  }

  updateProject(id: number, project: Project): Observable<Project> {
    return this.http.put<Project>(`${this.baseUrl}/updateProject/${id}`, project)
      .pipe(catchError(this.handleError));
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/deleteProject/${id}`)
      .pipe(catchError(this.handleError));
  }

  getProjectsByStatus(status: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/getProjectsByStatus/${status}`)
      .pipe(catchError(this.handleError));
  }

  getProjectsByLeader(leaderCIN: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/getProjectsByLeader/${leaderCIN}`)
      .pipe(catchError(this.handleError));
  }

  getProjectsByClientName(name: string): Observable<Project[]> {
    const params = new HttpParams().set('name', name);
    return this.http.get<Project[]>(`${this.baseUrl}/getProjectsByClient`, { params })
      .pipe(catchError(this.handleError));
  }

  
}
