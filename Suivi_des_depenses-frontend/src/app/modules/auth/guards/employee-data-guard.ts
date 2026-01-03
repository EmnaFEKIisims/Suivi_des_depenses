import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../auth-service';
import { EmployeeService } from '../../employee/employee-service';
import { Employee } from '../../employee/models/employee.model';
import { AlertService } from '../../../shared/services/alert.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeDataGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private employeeService: EmployeeService,
    private router: Router,
    private alertService: AlertService
  ) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const userEmail = this.auth.getEmail();

    // Not logged in
    if (!userEmail) {
      this.router.navigate(['/login']);
      return false;
    }

    // Get route parameter (reference or CIN)
    const param = route.paramMap.get('reference') || route.paramMap.get('CIN');
    if (!param) {
      return true; // Let backend handle missing param
    }

    try {
      const employee: Employee | undefined = await this.employeeService
        .getEmployeeByEmail(userEmail)
        .toPromise();

      // FIXED: Check if employee exists
      if (employee && (employee.reference === param || this.auth.hasRole('ADMIN'))) {
        return true;
      }
    } catch (error) {
      console.error('EmployeeDataGuard: Failed to fetch employee profile', error);
    }

    // Access denied
    this.alertService.showAccessDenied(
      'You can only view your own employee profile.'
    );
    this.router.navigate(['/home']);
    return false;
  }
}