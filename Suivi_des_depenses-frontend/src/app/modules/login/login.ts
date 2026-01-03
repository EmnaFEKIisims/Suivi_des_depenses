import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth-service';
import { EmployeeService } from '../employee/employee-service';
import { AlertService } from '../../shared/services/alert.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login implements OnInit {
loginForm!: FormGroup;
  errorMessage: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private employeeService: EmployeeService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      totpCode: [''],  // Optional for MFA
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
    this.markFormGroupTouched();
    this.errorMessage = 'Please fill in all fields correctly.';
    return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password, totpCode, rememberMe } = this.loginForm.value;

    this.authService.login(email, password, totpCode || null).subscribe({
      next: () => {
        const userEmail = this.authService.getEmail();
        if (!userEmail) {
          this.handleError('Authentication failed');
          return;
        }

        this.employeeService.getEmployeeByEmail(userEmail).subscribe({
          next: () => {
            this.isLoading = false;
            if (rememberMe) {
              localStorage.setItem('rememberedEmail', email);
            }
            this.goToHome();  // GO TO /home
          },
          error: () => this.handleError('Failed to load profile')
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.log('Login error:', error);
        // Remove the error message display for now
        // this.errorMessage = 'Invalid email, password, or TOTP code.';
      }
    });
  }

  private handleError(msg: string): void {
    this.isLoading = false;
    this.errorMessage = msg;
  }

  private markFormGroupTouched(): void {
    Object.values(this.loginForm.controls).forEach(control => control.markAsTouched());
  }

  // NAVIGATION
  goToHome(): void {
    this.router.navigate(['/home']);
  }

  goToWelcome(): void {
    this.router.navigate(['/welcome']);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onForgotPassword(): void {
    const email = this.loginForm.get('email')?.value;
    if (email && this.loginForm.get('email')?.valid) {
      this.alertService.showInfo(`Password reset sent to ${email}`, 'Password Reset');
    } else {
      this.alertService.showWarning('Please enter a valid email address', 'Invalid Email');
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!field && field.invalid && field.touched;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (!field?.errors) return '';

    if (field.errors['required']) return 'This field is required';
    if (field.errors['email']) return 'Invalid email';
    if (field.errors['minlength']) return `Min ${field.errors['minlength'].requiredLength} characters`;
    return '';
  }
}