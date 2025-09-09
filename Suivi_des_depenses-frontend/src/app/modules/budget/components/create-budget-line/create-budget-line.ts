import { Component, ViewChild, ElementRef } from '@angular/core';
import { BudgetServices } from '../../budget-services';
import { EmployeeService } from '../../../employee/employee-service';
import { getCurrencyDescription, CURRENCY_LIST } from '../../../request/models/expense-details.model';
import { Router } from '@angular/router';
import { BudgetType } from '../../models/budget.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal, { SweetAlertOptions } from 'sweetalert2'; // Import SweetAlertOptions type

@Component({
  selector: 'app-create-budget-line',
  templateUrl: './create-budget-line.html',
  styleUrls: ['./create-budget-line.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule]
})
export class CreateBudgetLine {
  employeeInput: string = '';
  employeeFullName: string = '';
  employeeReference: string = '';
  selectedType: BudgetType = BudgetType.CASH;
  selectedCurrency: string = '';
  currencyDescription: string = '';
  currencyList = CURRENCY_LIST;
  showSuccessAlert = false;
  showErrorAlert = false;
  errorMessage = '';
  BudgetType = BudgetType;
  amount: number | null = null;
  dropdownOpen: boolean = false;
  alertTimeout: any;

  @ViewChild('currencyInput') currencyInput!: ElementRef;

  constructor(
    private budgetService: BudgetServices,
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngAfterViewChecked() {
    if (this.dropdownOpen && this.currencyInput) {
      this.currencyInput.nativeElement.focus();
    }
  }

  searchEmployee(): void {
    if (!this.employeeInput) return;
    this.employeeService.getEmployeeByCIN(this.employeeInput).subscribe({
      next: emp => {
        this.employeeFullName = emp.fullName;
        this.employeeReference = emp.reference;
      },
      error: () => {
        this.employeeService.getEmployeeByReference(this.employeeInput).subscribe({
          next: emp => {
            this.employeeFullName = emp.fullName;
            this.employeeReference = emp.reference;
          },
          error: () => {
            this.employeeFullName = 'Not found';
            this.employeeReference = '';
          }
        });
      }
    });
  }

  updateCurrencyDescription(): void {
    this.currencyDescription = getCurrencyDescription(this.selectedCurrency);
  }

  selectCurrency(code: string): void {
    this.selectedCurrency = code;
    this.currencyDescription = getCurrencyDescription(code);
    this.dropdownOpen = false;
  }

  getSelectedCurrencyDescription(): string {
    const currency = this.currencyList.find(c => c.code === this.selectedCurrency);
    return currency ? currency.description : 'Select currency';
  }

  isFieldInvalid(controlName: string, form: any): boolean {
    const control = form.controls[controlName];
    return control?.invalid && (control?.touched || form.submitted) && control?.value === '';
  }

  triggerSweetAlert(type: 'success' | 'error', message: string) {
    const swalConfig: SweetAlertOptions = {
      icon: type === 'success' ? 'success' : 'error',
      title: type === 'success' ? 'Success!' : 'Error!',
      text: message,
      showConfirmButton: true,
      timer: type === 'success' ? 3000 : 5000,
      willOpen: () => {
        const popup = Swal.getPopup();
        if (popup) {
          const popupElement = popup as HTMLElement;
          popupElement.style.background = 'var(--bg-glass)';
          popupElement.style.border = 'var(--border-whisper)';
          popupElement.style.borderRadius = 'var(--radius-xl)';
          popupElement.style.backdropFilter = 'blur(16px)';
          popupElement.style.boxShadow = 'var(--shadow-medium)';
          const title = document.querySelector('.swal-title');
          if (title) {
            const titleElement = title as HTMLElement;
            titleElement.style.color = type === 'success' ? 'var(--emerald)' : 'var(--ruby)';
            titleElement.style.fontFamily = "'Playfair Display', serif";
            titleElement.style.fontSize = '1.5rem';
          }
        }
      }
    };

    Swal.fire(swalConfig).then(() => {
      if (type === 'success') {
        this.router.navigate(['/budget']);
      }
      this.showSuccessAlert = false;
      this.showErrorAlert = false;
    });
  }

  onSubmit(): void {
    if (!this.employeeInput || !this.selectedType || !this.selectedCurrency || !this.amount || this.amount <= 0) {
      this.triggerSweetAlert('error', 'Please fill all required fields correctly.');
      return;
    }
    this.budgetService.modifyBudget(
      this.selectedType,
      this.amount,
      this.selectedCurrency,
      this.employeeReference
    ).subscribe({
      next: () => {
        this.triggerSweetAlert('success', 'Budget line added successfully.');
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to add budget line. Please try again.';
        this.triggerSweetAlert('error', this.errorMessage);
      }
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}