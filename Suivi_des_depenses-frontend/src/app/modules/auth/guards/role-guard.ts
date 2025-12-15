import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../auth-service';
import { AlertService } from '../../../shared/services/alert.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Get required roles from route data
    const requiredRoles: string[] = route.data['roles'] || [];

    // Check if user has at least one required role
    const hasRole = requiredRoles.some(role => 
      this.authService.hasRole(role)
    );

    if (hasRole) {
      return true;
    } else {
      this.alertService.showAccessDenied(
        'You do not have the required permissions to access this page.'
      );
      this.router.navigate(['/home']);
      return false;
    }
  }
}