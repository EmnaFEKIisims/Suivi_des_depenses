import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

 private readonly apiUrl = 'http://localhost:8080/api/auth/login';
  private readonly jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient, private router: Router) {}

  // Login method to call POST /api/auth/login
  login(email: string, password: string, totpCode: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(this.apiUrl, { email, password, totpCode }).pipe(
      tap(response => this.storeToken(response.token))
    );
  }

  // Store JWT in localStorage
  private storeToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Decode JWT and extract roles
  getRoles(): string[] {
    const token = localStorage.getItem('token');
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      const decoded = this.jwtHelper.decodeToken(token);
      
      // Handle roles as array of objects with 'authority' property
      if (decoded.roles && Array.isArray(decoded.roles)) {
        const roles = decoded.roles.map((role: any) => 
          typeof role === 'string' ? role : role.authority
        );
        return roles;
      }
      return [];
    }
    return [];
  }

  // Check if user is logged in (JWT exists and is not expired)
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  // Get user’s email from JWT
  getEmail(): string | null {
    const token = localStorage.getItem('token');
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      const decoded = this.jwtHelper.decodeToken(token);
      return decoded.sub || null;
    }
    return null;
  }

  // Check if user has a specific role for RBAC
  hasRole(role: string): boolean {
    const roles = this.getRoles();
    return roles.includes(`ROLE_${role}`);
  }

  // Logout: Clear JWT and redirect to welcome page
  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/welcome']);
  }


  
}
