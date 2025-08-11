import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ExpenseRequestService } from '../../expense-request-service';
import { ProjectService } from '../../../project/project-service';
import { ExpenseRequest, ExpenseStatus, ReimbursementMethod } from '../../models/expense-request.model';
import { EmployeeService } from '../../../employee/employee-service';
import { CURRENCY_LIST, ExpenseDetails } from '../../models/expense-details.model';
import { Employee } from '../../../employee/models/employee.model';
import { Project } from '../../../project/models/project.model';
import { Subject } from 'rxjs';

interface DetailRow {
  description: string;
  amount: number;
  currency: string;
}

@Component({
  selector: 'app-create-request',
  standalone: false,
  templateUrl: './create-request.html',
  styleUrls: ['./create-request.scss']
})
export class CreateRequest implements OnInit {
  requestForm!: FormGroup;
  
  // Alerts
  showSuccessAlert = false;
  showErrorAlert = false;
  alertMessage = '';
  errorMessage = '';

  // Employee fields
  employeeCIN = '';
  employeeFullName = '';
  fullEmployee: Employee | null = null;

  // Project fields
  projectReference = '';
  projectName = '';
  projectSearchInput = '';
  selectedProjectId: number | null = null;
  projects: Project[] = [];
  allProjects: Project[] = [];
  fullProject: Project | null = null;
  projectSearchTerm$ = new Subject<string>();

  // Currency and details
  currencies = CURRENCY_LIST;
  detailRows: DetailRow[] = [];
  usedCurrencies: string[] = [];
  totalAmounts: { [key: string]: number } = {};
  
  // Enums
  reimbursementMethods = Object.values(ReimbursementMethod);

  constructor(
    private fb: FormBuilder,
    private requestService: ExpenseRequestService,
    private projectService: ProjectService,
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadProjects();
    this.setupProjectSearch();
    this.generateReference();
    console.log('ngOnInit - currencies loaded:', this.currencies.length, 'first 3:', this.currencies.slice(0, 3));
  }

  private initializeForm(): void {
    this.requestForm = this.fb.group({
      reference: ['', Validators.required],
      mission: ['', Validators.required],
      missionLocation: ['', Validators.required],
      startDate: ['', Validators.required],
      returnDate: ['', Validators.required],
      reimbursementMethod: [null, Validators.required]
    });
    
    // Disable the reference field after initialization
    this.requestForm.get('reference')?.disable();
  }

  private generateReference(): void {
    this.requestService.generateReference().subscribe(ref => {
      this.requestForm.get('reference')?.setValue(ref);
    });
  }

  private loadProjects(): void {
    this.projectService.getAllProjects().subscribe(projects => {
      this.allProjects = projects;
      this.projects = [...projects];
    });
  }

  private setupProjectSearch(): void {
    this.projectSearchTerm$.subscribe(term => {
      this.projectSearchInput = term;
      this.searchProjectsByName();
    });
  }

  // Navigation
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  // Employee methods
  fetchEmployee(): void {
    if (!this.employeeCIN.trim()) return;
    
    this.employeeService.getEmployeeByCIN(this.employeeCIN).subscribe({
      next: (emp) => {
        this.fullEmployee = emp;
        this.employeeFullName = emp.fullName;
      },
      error: () => {
        this.fullEmployee = null;
        this.employeeFullName = '';
        this.showError('Employee not found.');
      }
    });
  }

  // Project methods
  fetchProjectByReference(): void {
    if (!this.projectReference.trim()) return;
    
    this.projectService.getProjectByReference(this.projectReference).subscribe({
      next: (proj) => {
        this.fullProject = proj;
        this.projectName = proj.name;
        this.selectedProjectId = proj.idProject ?? null;
        this.projects = [proj];
      },
      error: () => {
        this.fullProject = null;
        this.projectName = '';
        this.selectedProjectId = null;
        this.projects = [...this.allProjects];
        this.showError('Project not found.');
      }
    });
  }

  searchProjectsByName(): void {
    if (!this.projectSearchInput.trim()) {
      this.projects = [...this.allProjects];
      return;
    }
    this.projects = this.allProjects.filter(project => 
      project.name.toLowerCase().includes(this.projectSearchInput.toLowerCase())
    );
  }

  selectProject(project: Project): void {
    this.fullProject = project;
    this.projectName = project.name;
    this.selectedProjectId = project.idProject ?? null;
    this.projectReference = project.reference;
  }

  // Detail rows management
  addDetail(): void {
    this.detailRows.push({
      description: '',
      amount: 0,
      currency: ''
    });
    console.log('addDetail called - detailRows length:', this.detailRows.length);
  }

  removeDetail(index: number): void {
    this.detailRows.splice(index, 1);
    this.updateCurrencyTotals();
  }

  trackByIndex(index: number): number {
    return index;
  }

  // Currency constraint logic
  getFilteredCurrencies(index: number): { code: string; description: string }[] {
    // Get all currently used currencies (excluding the current row being edited)
    const usedCurrenciesSet = new Set<string>();
    this.detailRows.forEach((row, i) => {
      if (i !== index && row.currency) {
        usedCurrenciesSet.add(row.currency);
      }
    });

    // If less than 2 different currencies are already used, show all currencies
    if (usedCurrenciesSet.size < 2) {
      return this.currencies.map(c => ({ code: c.code, description: c.description }));
    }

    // If exactly 2 currencies are already used, only show those 2 currencies
    const allowedCurrencies = Array.from(usedCurrenciesSet);
    const result = this.currencies
      .filter(c => allowedCurrencies.includes(c.code))
      .map(c => ({ code: c.code, description: c.description }));
    
    console.log('getFilteredCurrencies - 2 currencies constraint active. Showing only:', allowedCurrencies);
    return result;
  }

  onCurrencyChange(index: number, newCurrency: string): void {
    console.log('onCurrencyChange called - index:', index, 'newCurrency:', newCurrency);
    if (!newCurrency) return;

    // Calculate what currencies would be used after this change
    const tempRows = [...this.detailRows];
    tempRows[index] = { ...tempRows[index], currency: newCurrency };
    
    const usedCurrenciesSet = new Set<string>();
    tempRows.forEach(row => {
      if (row.currency) {
        usedCurrenciesSet.add(row.currency);
      }
    });

    // Check constraint: maximum 2 different currencies
    if (usedCurrenciesSet.size > 2) {
      this.showError('Maximum 2 different currencies allowed. Please choose from the currencies already used.');
      // Reset the currency to previous value
      this.detailRows[index].currency = '';
      return;
    }

    // Apply the change
    this.detailRows[index].currency = newCurrency;
    this.updateCurrencyTotals();
    console.log('Currency change applied. Used currencies:', Array.from(usedCurrenciesSet));
  }

  updateCurrencyTotals(): void {
    this.totalAmounts = {};
    this.usedCurrencies = [];

    this.detailRows.forEach(row => {
      if (row.currency && row.amount > 0) {
        this.totalAmounts[row.currency] = (this.totalAmounts[row.currency] || 0) + row.amount;
        if (!this.usedCurrencies.includes(row.currency)) {
          this.usedCurrencies.push(row.currency);
        }
      }
    });
  }

  // Form submission
  onSubmit(): void {
    // Validate form
    if (this.requestForm.invalid) {
      this.showError('Please fill in all required fields.');
      return;
    }

    if (!this.fullEmployee) {
      this.showError('Please fetch a valid employee first.');
      return;
    }

    if (!this.fullProject) {
      this.showError('Please fetch a valid project first.');
      return;
    }

    // Validate details
    const validDetails = this.detailRows.filter(row => 
      row.description && row.amount > 0 && row.currency
    );

    if (validDetails.length === 0) {
      this.showError('Please add at least one valid expense detail.');
      return;
    }

    // Check currency constraint
    const usedCurrenciesSet = new Set(validDetails.map(d => d.currency));
    if (usedCurrenciesSet.size > 2) {
      this.showError('You can only use up to 2 currencies.');
      return;
    }

    // Prepare payload
    const formValue = this.requestForm.getRawValue();
    const payload: ExpenseRequest = {
      reference: formValue.reference,
      mission: formValue.mission,
      missionLocation: formValue.missionLocation,
      startDate: formValue.startDate,
      returnDate: formValue.returnDate,
      reimbursementMethod: formValue.reimbursementMethod as ReimbursementMethod,
      status: ExpenseStatus.SUBMITTED,
      employee: {
        reference: this.fullEmployee.reference
      } as Employee,
      project: {
        idProject: this.fullProject.idProject
      } as Project,
      amountByCurrency: this.totalAmounts,
      details: validDetails.map(row => {
        const currencyDesc = this.currencies.find(c => c.code === row.currency)?.description || '';
        return {
          description: row.description,
          amount: row.amount,
          currency: row.currency,
          currencyDescription: currencyDesc
        } as ExpenseDetails;
      })
    };

    // Submit
    this.requestService.createExpenseRequest(payload).subscribe({
      next: () => {
        this.showSuccess('Expense request created successfully.');
        this.resetForm();
        setTimeout(() => {
          this.showSuccessAlert = false;
          this.router.navigate(['/requests']);
        }, 2000);
      },
      error: () => {
        this.showError('Failed to create expense request.');
      }
    });
  }

  // Form validation helper methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.requestForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.requestForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
    }
    return '';
  }

  hasValidDetails(): boolean {
    const validDetails = this.detailRows.filter(row => 
      row.description && row.description.trim() && 
      row.amount > 0 && 
      row.currency && row.currency.trim()
    );
    return validDetails.length > 0;
  }

  // Detail field validation helpers
  isDetailFieldInvalid(index: number, field: string): boolean {
    const detail = this.detailRows[index];
    if (!detail) return false;
    
    switch (field) {
      case 'description':
        return !detail.description || detail.description.trim() === '';
      case 'amount':
        return !detail.amount || detail.amount <= 0;
      case 'currency':
        return !detail.currency || detail.currency.trim() === '';
      default:
        return false;
    }
  }

  isAnyDetailFieldTouched(index: number): boolean {
    const detail = this.detailRows[index];
    return !!(detail && (detail.description || detail.amount || detail.currency));
  }

  // Helper methods
  private showSuccess(message: string): void {
    this.alertMessage = message;
    this.showSuccessAlert = true;
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.showErrorAlert = true;
    setTimeout(() => this.showErrorAlert = false, 5000);
  }

  private resetForm(): void {
    this.requestForm.reset();
    this.detailRows = [];
    this.usedCurrencies = [];
    this.totalAmounts = {};
    this.employeeCIN = '';
    this.employeeFullName = '';
    this.projectReference = '';
    this.projectName = '';
    this.projectSearchInput = '';
    this.projects = [...this.allProjects];
    this.fullEmployee = null;
    this.fullProject = null;
  }

  // Debug method for currency dropdown
  logNgSelectOpen(index: number): void {
    console.log('Currency dropdown opened for row:', index, {
      availableCurrencies: this.getFilteredCurrencies(index).length,
      currentCurrency: this.detailRows[index]?.currency,
      usedCurrencies: this.usedCurrencies
    });
  }
}
