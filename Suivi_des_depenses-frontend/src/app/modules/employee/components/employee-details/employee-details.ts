import { Component } from '@angular/core';
import { Employee } from '../../models/employee.model';
import { EmployeeService } from '../../employee-service';
import { ActivatedRoute , Router} from '@angular/router';




@Component({
  selector: 'app-employee-details',
  standalone: false,
  templateUrl: './employee-details.html',
  styleUrls : ['./employee-details.scss']
})
export class EmployeeDetails {
  employee: Employee | undefined;
  showPassword = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService
  ) { }

  ngOnInit(): void {
    const reference = this.route.snapshot.paramMap.get('reference');
    if (reference) {
      this.loadEmployeeDetails(reference);
    }
  }

  loadEmployeeDetails(reference: string): void {
    this.employeeService.getEmployeeByReference(reference).subscribe({
      next: (employee) => {
        this.employee = employee;
        console.log('Employee Data:', employee);
      },
      error: (err) => {
        console.error('Error loading employee details:', err);
      }
    });
  }

  calculateAge(birthDate: string | Date | undefined): number {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

    navigateToEdit(): void {
    if (this.employee?.cin) {
      this.router.navigate([`/update-employee/${this.employee.cin}`]);
    }
  }

}
