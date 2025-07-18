import { Component, OnInit } from '@angular/core';
import { Employee , Department } from '../../models/employee.model';
import { EmployeeService } from '../../employee-service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';



@Component({
  selector: 'app-employee-list',
  standalone: false,
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.scss'
})
export class EmployeeList implements OnInit {
   employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  departments = Object.values(Department);
  selectedStatus: string = 'Actif';
  selectedDepartment: string = 'All';
  searchTerm: string = '';
  isLoading: boolean = false;

  constructor(
    private employeeService: EmployeeService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.employeeService.getEmployeesByStatus(this.selectedStatus).subscribe({
      next: (employees) => {
        this.employees = employees;
        this.filterEmployees();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading employees:', err);
        this.isLoading = false;
      }
    });
  }

  onStatusChange(): void {
    if (this.selectedStatus === 'All') {
      this.employeeService.getAllEmployees().subscribe(employees => {
        this.employees = employees;
        this.filterEmployees();
      });
    } else {
      this.loadEmployees();
    }
  }

  onDepartmentChange(): void {
    if (this.selectedDepartment === 'All') {
      this.loadEmployees();
    } else {
      this.employeeService.getEmployeesByDepartment(this.selectedDepartment).subscribe(employees => {
        this.employees = employees;
        this.filterEmployees();
      });
    }
  }

onSearch(): void {
  const search = this.searchTerm.trim();
  if (!search) {
    this.filterEmployees();
    return;
  }

  this.employeeService.getEmployeeByReference(search).pipe(
    catchError(() => this.employeeService.getEmployeeByPhone(search)),
    catchError(() => this.employeeService.getEmployeeByUsername(search)),
    catchError(() => of(null))
  ).subscribe(employee => {
    this.filteredEmployees = employee ? [employee] : [];
  });
}




  filterEmployees(): void {
    if (this.selectedDepartment === 'All') {
      this.filteredEmployees = [...this.employees];
    } else {
      this.filteredEmployees = this.employees.filter(
        emp => emp.department === this.selectedDepartment
      );
    }
  }




  viewDetails(reference: string): void {
    this.router.navigate(['/employees/details', reference]);
  }

  editEmployee(reference: string): void {
    this.router.navigate(['/update-employee', reference]);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

createNewEmployee(): void {
  this.router.navigate(['add-employee']);
}





}
