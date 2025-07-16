import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ExpenseRequestService } from '../../expense-request-service';
import { ProjectService } from '../../../project/project-service';
import { ExpenseRequest, ExpenseStatus, ReimbursementMethod } from '../../models/expense-request.model';
import { Project } from '../../../project/models/project.model';
import { Observable, of } from 'rxjs';
import { EmployeeService } from '../../../employee/employee-service';
import { CURRENCY_LIST } from '../../models/expense-details.model';
import { catchError } from 'rxjs/operators';
import { Employee } from '../../../employee/models/employee.model';

@Component({
  selector: 'app-create-request',
  standalone: false,
  templateUrl: './create-request.html',
  styleUrl: './create-request.scss'
})
export class CreateRequest implements OnInit {
  requestForm: FormGroup;
  projects: Project[] = [];
  currencies = CURRENCY_LIST;
  currencyDescriptions = [...new Set(CURRENCY_LIST.map(c => c.description))];
  isLoading = false;
  errorMessage: string = '';
  totalByCurrency: { [key: string]: number } = {};
  usedCurrencies: string[] = [];

  constructor(
    private fb: FormBuilder,
    private expenseRequestService: ExpenseRequestService,
    private projectService: ProjectService,
    private employeeService: EmployeeService,
    private router: Router
  ) {
    this.requestForm = this.fb.group({
      cinInput: ['', Validators.required],
      employee: [null, Validators.required],
      projectId: ['', Validators.required],
      startDate: ['', Validators.required],
      returnDate: ['', Validators.required],
      mission: ['', Validators.required],
      missionLocation: ['', Validators.required],
      reimbursementMethod: [ReimbursementMethod.CASH_DESK, Validators.required],
      expenseDetails: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.isLoading = true;
    this.projectService.getAllProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading projects:', err);
        this.isLoading = false;
      }
    });
  }

  fetchEmployeeByCin(): void {
    const cin = this.requestForm.get('cinInput')?.value;
    if (!cin) return;

    this.isLoading = true;
    this.employeeService.getEmployeeByCIN(cin).subscribe({
      next: (employee) => {
        if (employee) {
          this.requestForm.patchValue({ employee });
        } else {
          alert('Employee not found with this CIN');
        }
        this.isLoading = false;
      },
      error: (err) => {
        alert('Error fetching employee');
        this.isLoading = false;
      }
    });
  }

  get expenseDetails(): FormArray {
    return this.requestForm.get('expenseDetails') as FormArray;
  }

  addExpenseDetail(): void {
    const currentCurrencies = this.getUniqueCurrencies();
    
    if (currentCurrencies.length >= 2 && 
        !currentCurrencies.includes(this.expenseDetails.value[0]?.currency)) {
      this.errorMessage = 'Maximum of 2 different currencies allowed';
      return;
    }

    const control = this.fb.group({
      description: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      currency: ['', Validators.required],
      currencyDescription: ['']
    });

    control.get('currency')?.valueChanges.subscribe(code => {
      const selected = this.currencies.find(c => c.code === code);
      if (selected) {
        control.get('currencyDescription')?.setValue(selected.description, { emitEvent: false });
      }
      this.updateUsedCurrencies();
      this.updateTotalByCurrency();
    });

    this.expenseDetails.push(control);
    this.updateUsedCurrencies();
    this.updateTotalByCurrency();
  }

  removeExpenseDetail(index: number): void {
    this.expenseDetails.removeAt(index);
    this.updateUsedCurrencies();
    this.updateTotalByCurrency();
  }

  getUniqueCurrencies(): string[] {
    const currencies = this.expenseDetails.controls
      .map(control => control.get('currency')?.value)
      .filter(Boolean);
    return [...new Set(currencies)];
  }

  updateUsedCurrencies(): void {
    this.usedCurrencies = this.getUniqueCurrencies();
    this.errorMessage = '';
  }

  isCurrencyDisabled(currencyCode: string): boolean {
    return this.usedCurrencies.length >= 2 && !this.usedCurrencies.includes(currencyCode);
  }

  updateTotalByCurrency(): void {
    this.totalByCurrency = {};
    this.expenseDetails.controls.forEach(control => {
      const amount = control.get('amount')?.value;
      const currency = control.get('currency')?.value;
      if (amount && currency) {
        this.totalByCurrency[currency] = (this.totalByCurrency[currency] || 0) + +amount;
      }
    });
  }

  getCurrencyKeys(): string[] {
    return Object.keys(this.totalByCurrency);
  }

  getCurrencyDescription(code: string): string {
    if (!code) return '';
    const currency = this.currencies.find(c => c.code === code);
    return currency ? currency.description : '';
  }

  onSubmit(): void {
    const uniqueCurrencies = this.getUniqueCurrencies();
    if (uniqueCurrencies.length > 2) {
      this.errorMessage = 'Maximum of 2 different currencies allowed';
      return;
    }

    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.requestForm.getRawValue();
    const selectedProject = this.projects.find(p => p.idProject === +formValue.projectId);

    if (!selectedProject) {
      alert('Please select a valid project');
      this.isLoading = false;
      return;
    }

    const request: ExpenseRequest = {
      employee: formValue.employee,
      project: selectedProject,
      startDate: formValue.startDate,
      returnDate: formValue.returnDate,
      mission: formValue.mission,
      missionLocation: formValue.missionLocation,
      reimbursementMethod: formValue.reimbursementMethod,
      status: ExpenseStatus.DRAFT,
      details: formValue.expenseDetails,
      amountByCurrency: this.totalByCurrency
    };

    this.expenseRequestService.createExpenseRequest(request).subscribe({
      next: () => {
        this.router.navigate(['/requests']);
      },
      error: (err) => {
        console.error('Creation error:', err);
        alert('Error creating request');
        this.isLoading = false;
      }
    });
  }
}
