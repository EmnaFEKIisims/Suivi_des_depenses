import { Component , OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseRequestService } from '../../expense-request-service';
import { ProjectService } from '../../../project/project-service';
import { ExpenseRequest, ExpenseStatus, ReimbursementMethod } from '../../models/expense-request.model';
import { Project } from '../../../project/models/project.model';
import { CURRENCY_LIST } from '../../models/expense-details.model';
import { EmployeeService } from '../../../employee/employee-service';


@Component({
  selector: 'app-update-request',
  standalone: false,
  templateUrl: './update-request.html',
  styleUrl: './update-request.scss'
})
export class UpdateRequest implements OnInit {

requestForm: FormGroup;
  requestId!: number;
  projects: Project[] = [];
  currencies = CURRENCY_LIST;
  isLoading = false;
  errorMessage: string = '';
  totalByCurrency: { [key: string]: number } = {};
  usedCurrencies: string[] = [];

  constructor(
    private fb: FormBuilder,
    private expenseRequestService: ExpenseRequestService,
    private projectService: ProjectService,
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.requestForm = this.fb.group({
      employee: [null, Validators.required],
      projectId: ['', Validators.required],
      startDate: ['', Validators.required],
      returnDate: ['', Validators.required],
      mission: ['', Validators.required],
      missionLocation: ['', Validators.required],
      reimbursementMethod: [ReimbursementMethod.CASH_DESK, Validators.required],
      expenseDetails: this.fb.array([]),
      status: [ExpenseStatus.DRAFT]
    });
  }

  ngOnInit(): void {
    this.requestId = +this.route.snapshot.paramMap.get('id')!;
    this.loadProjects();
    this.loadRequest();
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

  loadRequest(): void {
    this.isLoading = true;
    this.expenseRequestService.getExpenseRequestById(this.requestId).subscribe({
      next: (request) => {
        this.patchFormValues(request);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading request:', err);
        this.isLoading = false;
      }
    });
  }

  patchFormValues(request: ExpenseRequest): void {
    this.requestForm.patchValue({
      employee: request.employee,
      projectId: request.project.idProject,
      startDate: request.startDate,
      returnDate: request.returnDate,
      mission: request.mission,
      missionLocation: request.missionLocation,
      reimbursementMethod: request.reimbursementMethod,
      status: request.status
    });

    request.details.forEach(detail => {
      this.addExpenseDetail(detail);
    });
    this.updateUsedCurrencies();
    this.updateTotalByCurrency();
  }

  get expenseDetails(): FormArray {
    return this.requestForm.get('expenseDetails') as FormArray;
  }

  addExpenseDetail(detail?: any): void {
    const control = this.fb.group({
      description: [detail?.description || '', Validators.required],
      amount: [detail?.amount || '', [Validators.required, Validators.min(0.01)]],
      currency: [detail?.currency || '', Validators.required],
      currencyDescription: [detail?.currencyDescription || '']
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
      idRequest: this.requestId,
      employee: formValue.employee,
      project: selectedProject,
      startDate: formValue.startDate,
      returnDate: formValue.returnDate,
      mission: formValue.mission,
      missionLocation: formValue.missionLocation,
      reimbursementMethod: formValue.reimbursementMethod,
      status: formValue.status,
      details: formValue.expenseDetails,
      amountByCurrency: this.totalByCurrency
    };

    this.expenseRequestService.updateExpenseRequest(this.requestId, request).subscribe({
      next: () => {
        this.router.navigate(['/requests']);
      },
      error: (err) => {
        console.error('Update error:', err);
        alert('Error updating request');
        this.isLoading = false;
      }
    });
  }






}
