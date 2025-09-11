import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Employee , Department } from '../../models/employee.model';
import { EmployeeService } from '../../employee-service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';



@Component({
  selector: 'app-employee-list',
  standalone: false,
  templateUrl: './employee-list.html',
  styleUrls: [
    '../../../../shared/styles/executive-list-template.scss',
    './employee-list.scss'
  ],
  encapsulation: ViewEncapsulation.None
})
export class EmployeeList implements OnInit {
   employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  departments = Object.values(Department);
  selectedStatus: string = 'Actif';
  selectedDepartment: string = '';
  searchTerm: string = '';
  isLoading: boolean = false;
  private searchTerms = new Subject<string>();

  constructor(
    private employeeService: EmployeeService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        console.log('Loaded employees:', employees);
        this.employees = employees;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading employees:', err);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredEmployees = this.employees.filter(emp => {
      // Status filter
      const matchesStatus = !this.selectedStatus || emp.status === this.selectedStatus;
      
      // Department filter
      const matchesDepartment = !this.selectedDepartment || emp.department === this.selectedDepartment;

      // Search filter (name or phone)
      const matchesSearch = !this.searchTerm ||
        emp.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        emp.phoneNumber.toLowerCase().includes(this.searchTerm.toLowerCase());

      return matchesStatus && matchesDepartment && matchesSearch;
    });
    console.log('Filtered employees:', this.filteredEmployees);
  }

  viewEmployee(reference: string): void {
    this.router.navigate(['/employees/details', reference]);
  }

  editEmployee(cin: string): void {
    this.router.navigate(['/update-employee'], { state: { cin } });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

createNewEmployee(): void {
  this.router.navigate(['/add-employee']);
}

}
