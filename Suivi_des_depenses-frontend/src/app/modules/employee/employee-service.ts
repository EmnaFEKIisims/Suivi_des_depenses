import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from './models/employee.model';
import { Department } from './models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private apiUrl = 'http://localhost:8080/api/employees';

  constructor(private http: HttpClient) { }

  
  createEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(`${this.apiUrl}/createEmployee`, employee);
  }

  
  updateEmployee(cin: string, employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/updateEmployee/${cin}`, employee);
  }

  
  getEmployeeByCIN(cin: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/getEmployeeByCIN/${cin}`);
  }

  
  getEmployeeByUsername(username: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/getEmployeeByUsername/${username}`);
  }

  
  getEmployeeByPhone(phone: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/getEmployeeByPhone/${phone}`);
  }

 
  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}`);
  }

  
  getEmployeesByStatus(status: string): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/getEmployeesByStatus/${status}`);
  }

  
  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.apiUrl}/getDepartments`);
  }

  
  getOccupationsByDepartment(department: Department): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/departments/${department}/occupations`);
  }

  
  getEmployeeByReference(reference: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/getEmployeeByReference/${reference}`);
  }

  
  getEmployeesByDepartment(department: string): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/getEmployeesByDepartment/${department}`);
  }

  
  generateReference(): Observable<string> {
    return this.http.get(`${this.apiUrl}/generate-reference`, { responseType: 'text' });
  }


  getEmployeeByEmail(email: string): Observable<Employee> {
  return this.http.get<Employee>(`${this.apiUrl}/getEmployeesByEmail?email=${email}`);
}


}
