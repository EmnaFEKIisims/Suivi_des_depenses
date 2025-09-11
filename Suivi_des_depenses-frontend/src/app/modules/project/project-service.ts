import { Injectable } from '@angular/core';
import { Project } from './models/project.model';
import { Observable , throwError } from 'rxjs';
import { HttpClient , HttpParams , HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

 private apiUrl = 'http://localhost:8080/api/projects';

  constructor(private http: HttpClient) { }

  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}`);
  }

  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/getProjectById/${id}`);
  }

  createProject(project: Project): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/createProject`, project);
  }

  updateProject(id: number, project: Project): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/updateProject/${id}`, project);
  }

  getProjectsByStatus(status: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/getProjectsByStatus/${status}`);
  }

  getProjectsByLeader(leaderReference: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/getProjectsByLeader/${leaderReference}`);
  }

  getProjectsByClientName(name: string): Observable<Project[]> {
    let params = new HttpParams().set('name', name);
    return this.http.get<Project[]>(`${this.apiUrl}/getProjectsByClient`, { params });
  }

  getProjectsByClientId(clientId: number): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/getProjectsByClient/${clientId}`);
  }

  getProjectByReference(reference: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/getProjectsByReference/${reference}`);
  }

  generateReference(): Observable<string> {
    return this.http.get(`${this.apiUrl}/generate-reference`, { responseType: 'text' });
  }
}
