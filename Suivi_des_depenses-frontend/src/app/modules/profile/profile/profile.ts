import { Component , OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { EmployeeService } from '../../employee/employee-service';
import { AuthService } from '../../auth/auth-service';
import { Employee , Gender , Status , Department } from '../../employee/models/employee.model';


@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  employee: Employee | null = null;
  loading = true;
  error = '';
  showPassword = false;  // For password visibility toggle

  // Helpers for display
  genderMap: { [key: string]: string } = { [Gender.MALE]: 'Male', [Gender.FEMALE]: 'Female' };
  statusMap: { [key: string]: string } = { [Status.ACTIF]: 'Active', [Status.INACTIF]: 'Inactive' };
  departmentMap: { [key: string]: string } = {
    [Department.IT]: 'IT',
    [Department.Maintenance]: 'Maintenance',
    [Department.Commercial]: 'Commercial',
    [Department.Accounting]: 'Accounting',
    [Department.HR]: 'HR',
    [Department.Production]: 'Production',
    [Department.Building_Infrastructure]: 'Building & Infrastructure'
  };

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const email = this.authService.getEmail();
    if (!email) {
      this.router.navigate(['/login']);
      return;
    }

    this.employeeService.getEmployeeByEmail(email).subscribe({
      next: (emp) => {
        this.employee = emp;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
        this.error = 'Unable to load profile. Please try again.';
        this.loading = false;
      }
    });
  }


  // Add this method to your ProfileComponent
calculateTenure(): string {
    if (!this.employee?.hireDate) return '—';
    
    const hireDate = new Date(this.employee.hireDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - hireDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
        const years = Math.floor(diffDays / 365);
        const remainingMonths = Math.floor((diffDays % 365) / 30);
        return `${years} year${years !== 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}` : ''}`;
    }
}

  // Format date for display
  formatDate(date: Date | string | null | undefined): string {
    if (!date) return '—';
    const d = new Date(date);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB');
  }

  // Toggle password visibility
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Get displayed roles for user
  getDisplayRoles(): string[] {
    if (!this.employee?.roles) return [];
    return this.employee.roles.map(role => 
      role === 'ROLE_ADMIN' ? 'Administrator' : 'Employee'
    );
  }

  // Check if user is ADMIN
  isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

}
