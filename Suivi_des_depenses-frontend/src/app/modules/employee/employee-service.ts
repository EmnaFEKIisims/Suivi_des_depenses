import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from './models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

   private apiUrl = 'http://localhost:8080/api/employees';

  constructor(private http: HttpClient) {}

  createEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(`${this.apiUrl}/createEmployee`, employee);
  }

  updateEmployee(cin: string, employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/updateEmployee/${cin}`, employee);
  }

  deleteEmployee(cin: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteEmployee/${cin}`);
  }

  getEmployeeByCIN(cin: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/getEmployeeByCIN/${cin}`);
  }

  getEmployeeByUsername(username: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/getEmployeeByUsername/${username}`);
  }

  getEmployeeByPhoneNumber(phoneNumber: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/getEmployeeByPhone/${phoneNumber}`);
  }

  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }
}
