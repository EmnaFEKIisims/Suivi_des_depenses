import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ExpenseRequestService } from '../../expense-request-service';
import { ProjectService } from '../../../project/project-service';
import { ExpenseRequest, ExpenseStatus, ReimbursementMethod } from '../../models/expense-request.model';
import { EmployeeService } from '../../../employee/employee-service';
import { CURRENCY_LIST, ExpenseDetails } from '../../models/expense-details.model';
import { Employee } from '../../../employee/models/employee.model';
import { Project } from '../../../project/models/project.model';
import { Subject } from 'rxjs';
import Swal, { SweetAlertOptions } from 'sweetalert2';

interface DetailRow {
  description: string;
  amount: number;
  currency: string;
}

@Component({
  selector: 'app-create-request',
  templateUrl: './create-request.html',
  styleUrls: ['./create-request.scss', './total-amounts-styles.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false
})
export class CreateRequest implements OnInit {
  requestForm!: FormGroup;
  detailRows: DetailRow[] = [];
  currencies = CURRENCY_LIST;
  usedCurrencies: string[] = [];
  totalAmounts: { [key: string]: number } = {};
  employeeCIN = '';
  employeeFullName = '';
  fullEmployee: Employee | null = null;
  employeeCINTouched = false;
  projectReference = '';
  projectName = '';
  selectedProjectId: number | null = null;
  projectSelectTouched = false;
  projects: Project[] = [];
  allProjects: Project[] = [];
  fullProject: Project | null = null;
  projectSearchTerm$ = new Subject<string>();
  showSuccessAlert = false;
  showErrorAlert = false;
  errorMessage = '';
  reimbursementMethods = Object.values(ReimbursementMethod);
  private filteredCurrenciesPerRow: { code: string; description: string }[][] = [];

  @ViewChild('successAlert') successAlert!: ElementRef;
  @ViewChild('errorAlert') errorAlert!: ElementRef;

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
  }

  private initializeForm(): void {
    this.requestForm = this.fb.group({
      reference: ['', Validators.required],
      mission: ['', Validators.required],
      missionLocation: ['', Validators.required],
      start_date: ['', Validators.required],
      return_date: ['', Validators.required],
      reimbursementMethod: [null, Validators.required],
      details: this.fb.array([])
    });

    this.requestForm.get('reference')?.disable();
    this.requestForm.get('return_date')?.setValidators([
      Validators.required,
      (control) => {
        const start = this.requestForm?.get('start_date')?.value;
        const end = control.value;
        return start && end && new Date(end) < new Date(start)
          ? { invalidReturnDate: true }
          : null;
      }
    ]);
  }

  get details(): FormArray {
    return this.requestForm.get('details') as FormArray;
  }

  private generateReference(): void {
    this.requestService.generateReference().subscribe({
      next: (ref) => {
        this.requestForm.get('reference')?.setValue(ref);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to generate request reference.';
        this.triggerSweetAlert('error', this.errorMessage);
      }
    });
  }

  private loadProjects(): void {
    this.projectService.getAllProjects().subscribe({
      next: (projects) => {
        this.allProjects = projects;
        this.projects = [...projects];
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load projects.';
        this.triggerSweetAlert('error', this.errorMessage);
      }
    });
  }

  private setupProjectSearch(): void {
    this.projectSearchTerm$.subscribe(term => {
      this.searchProjectsByName(term);
    });
  }

  fetchEmployee(): void {
    if (!this.employeeCIN.trim()) {
      this.employeeCINTouched = true;
      this.triggerSweetAlert('error', 'Please enter a valid CIN.');
      return;
    }

    this.employeeService.getEmployeeByCIN(this.employeeCIN).subscribe({
      next: (emp) => {
        this.fullEmployee = emp;
        this.employeeFullName = emp.fullName;
        this.employeeCINTouched = true;
      },
      error: (err) => {
        this.fullEmployee = null;
        this.employeeFullName = '';
        this.employeeCINTouched = true;
        this.errorMessage = err.error?.message || 'Employee not found.';
        this.triggerSweetAlert('error', this.errorMessage);
      }
    });
  }

  fetchProjectByReference(): void {
    if (!this.projectReference.trim()) {
      this.projectSelectTouched = true;
      return;
    }

    this.projectService.getProjectByReference(this.projectReference).subscribe({
      next: (proj) => {
        this.fullProject = proj;
        this.projectName = proj.name;
        this.selectedProjectId = proj.idProject ?? null;
        this.projects = [proj];
        this.projectSelectTouched = true;
      },
      error: (err) => {
        this.fullProject = null;
        this.projectName = '';
        this.selectedProjectId = null;
        this.projects = [...this.allProjects];
        this.projectSelectTouched = true;
        this.errorMessage = err.error?.message || 'Project not found.';
        this.triggerSweetAlert('error', this.errorMessage);
      }
    });
  }

  searchProjectsByName(term: string): void {
    if (!term.trim()) {
      this.projects = [...this.allProjects];
      return;
    }
    this.projects = this.allProjects.filter(project =>
      project.name.toLowerCase().includes(term.toLowerCase())
    );
  }

  selectProject(project: Project): void {
    this.fullProject = project;
    this.projectName = project.name;
    this.selectedProjectId = project.idProject ?? null;
    this.projectReference = project.reference;
    this.projectSelectTouched = true;
  }

  addDetail(): void {
    this.detailRows.push({
      description: '',
      amount: 0,
      currency: ''
    });
    this.details.push(this.fb.group({
      description: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      currency: ['', Validators.required]
    }));
    this.updateAllFilteredCurrencies();
  }

  removeDetail(index: number): void {
    this.detailRows.splice(index, 1);
    this.details.removeAt(index);
    this.updateAllFilteredCurrencies();
    this.updateCurrencyTotals();
  }

  trackByIndex(index: number): number {
    return index;
  }

  private updateAllFilteredCurrencies(): void {
    this.filteredCurrenciesPerRow = this.detailRows.map((_, index) => this.computeFilteredCurrencies(index));
  }

  private computeFilteredCurrencies(index: number): { code: string; description: string }[] {
    return this.currencies; // Default to all currencies, filtered by onCurrencyChange
  }

  getFilteredCurrencies(index: number): { code: string; description: string }[] {
    return this.filteredCurrenciesPerRow[index] || [];
  }

  setDetailValue(index: number, field: string, value: any): void {
    this.details.at(index).get(field)?.setValue(value);
  }

  markDetailTouched(index: number, field: string): void {
    this.details.at(index).get(field)?.markAsTouched();
  }

  onCurrencyChange(index: number, newCurrency: string): void {
    if (!newCurrency) return;

    const tempRows = [...this.detailRows];
    tempRows[index] = { ...tempRows[index], currency: newCurrency };

    const tempCurrencies = new Set<string>();
    tempRows.forEach((row, i) => {
      const currency = i === index ? newCurrency : row.currency;
      if (currency && currency.trim()) tempCurrencies.add(currency);
    });

    if (tempCurrencies.size > 2) {
      this.triggerSweetAlert('error', 'Maximum 2 different currencies allowed. Please choose from the currencies already used.');
      this.detailRows[index].currency = '';
      this.details.at(index).get('currency')?.setValue('');
      return;
    }

    this.detailRows[index].currency = newCurrency;
    this.details.at(index).get('currency')?.setValue(newCurrency);
    this.updateAllFilteredCurrencies();
    this.updateCurrencyTotals();
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

  formatted(amount: number): string {
    if (amount == null) return '';
    const rounded = Math.round(amount * 100) / 100;
    const [integerPart, decimalPart = '00'] = rounded.toString().split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return decimalPart === '00' ? `${formattedInteger}` : `${formattedInteger}.${decimalPart}`;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.requestForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isDetailFieldInvalid(index: number, field: string): boolean {
    const detail = this.details.at(index);
    if (!detail) return false;
    const control = detail.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  isAnyDetailFieldTouched(index: number): boolean {
    const detail = this.detailRows[index];
    return !!(detail && (detail.description || detail.amount || detail.currency));
  }

  hasValidDetails(): boolean {
    return this.detailRows.some(row =>
      row.description && row.description.trim() &&
      row.amount > 0 &&
      row.currency && row.currency.trim()
    );
  }

  getCurrencyDescription(code: string): string {
    const currency = this.currencies.find(c => c.code === code);
    return currency ? currency.description : code;
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
          const title = document.querySelector('.swal2-title');
          if (title) {
            const titleElement = title as HTMLElement;
            titleElement.style.color = type === 'success' ? 'var(--emerald)' : 'var(--ruby)';
            titleElement.style.fontFamily = "'Playfair Display', serif'";
            titleElement.style.fontSize = '1.5rem';
          }
        }
      }
    };

    Swal.fire(swalConfig).then(() => {
      if (type === 'success') {
        this.router.navigate(['/requests']);
      }
      this.showSuccessAlert = false;
      this.showErrorAlert = false;
    });
  }

  onSubmit(): void {
    this.employeeCINTouched = true;
    this.projectSelectTouched = true;
    this.requestForm.markAllAsTouched();
    this.markFormGroupTouched(this.requestForm);

    if (this.requestForm.invalid) {
      this.triggerSweetAlert('error', 'Please fill in all required fields correctly.');
      return;
    }

    if (!this.fullEmployee) {
      this.triggerSweetAlert('error', 'Please fetch a valid employee.');
      return;
    }

    if (!this.fullProject) {
      this.triggerSweetAlert('error', 'Please select a valid project.');
      return;
    }

    const validDetails = this.detailRows.filter(row =>
      row.description && row.description.trim() &&
      row.amount > 0 &&
      row.currency && row.currency.trim()
    );

    if (validDetails.length === 0) {
      this.triggerSweetAlert('error', 'Please add at least one valid expense detail.');
      return;
    }

    const formValue = this.requestForm.getRawValue();
    const payload: ExpenseRequest = {
      reference: formValue.reference,
      mission: formValue.mission,
      missionLocation: formValue.missionLocation,
      startDate: this.formatDate(formValue.start_date),
      returnDate: this.formatDate(formValue.return_date),
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

    this.requestService.createExpenseRequest(payload).subscribe({
      next: () => {
        this.triggerSweetAlert('success', 'Expense request created successfully.');
        this.resetForm();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to create expense request.';
        this.triggerSweetAlert('error', this.errorMessage);
      }
    });
  }

  private formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private resetForm(): void {
    this.requestForm.reset();
    this.detailRows = [];
    this.details.clear();
    this.usedCurrencies = [];
    this.totalAmounts = {};
    this.employeeCIN = '';
    this.employeeFullName = '';
    this.projectReference = '';
    this.projectName = '';
    this.selectedProjectId = null;
    this.projects = [...this.allProjects];
    this.fullEmployee = null;
    this.fullProject = null;
    this.employeeCINTouched = false;
    this.projectSelectTouched = false;
    this.filteredCurrenciesPerRow = [];
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}