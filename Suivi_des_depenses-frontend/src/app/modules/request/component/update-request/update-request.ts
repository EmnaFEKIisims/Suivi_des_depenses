import { Component , OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators , FormControl  } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseRequestService } from '../../expense-request-service';
import { ProjectService } from '../../../project/project-service';
import { ExpenseRequest, ExpenseStatus, ReimbursementMethod } from '../../models/expense-request.model';
import { Project } from '../../../project/models/project.model';
import { Employee } from '../../../employee/models/employee.model';
import { CURRENCY_LIST } from '../../models/expense-details.model';
import { EmployeeService } from '../../../employee/employee-service';


@Component({
  selector: 'app-update-request',
  standalone: false,
  templateUrl: './update-request.html',
  styleUrl: './update-request.scss'
})
export class UpdateRequest implements OnInit {

   requestForm!: FormGroup;
  request!: ExpenseRequest;

  currencies = CURRENCY_LIST;
  totalAmounts: { [key: string]: number } = {};
  usedCurrencies: string[] = [];

  showSuccessAlert = false;
  showErrorAlert = false;
  alertMessage = '';
  errorMessage = '';

  reimbursementMethods = Object.values(ReimbursementMethod);
  expenseStatuses = Object.values(ExpenseStatus);

  formattedTotals = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private requestService: ExpenseRequestService
  ) {}

  ngOnInit(): void {
    this.requestForm = this.fb.group({
      reference: ['', Validators.required],
      mission: ['', Validators.required],
      missionLocation: ['', Validators.required],
      startDate: ['', Validators.required],
      returnDate: ['', Validators.required],
      reimbursementMethod: [''],
      details: this.fb.array([])
    });

    const id = +this.route.snapshot.paramMap.get('id')!;
    this.requestService.getExpenseRequestById(id).subscribe(req => {
      this.request = req;
      this.populateForm();
      // Disable these fields after setting values
      this.requestForm.get('reference')?.disable();
      this.requestForm.get('reimbursementMethod')?.disable();
    });
  }

  

  get detailControls(): FormArray {
    return this.requestForm.get('details') as FormArray;
  }

getControl(name: string): FormControl {
  return this.requestForm.get(name) as FormControl;
}

getDetailControl(index: number, controlName: string): FormControl {
  return (this.detailControls.at(index) as FormGroup).get(controlName) as FormControl;
}


  populateForm(): void {
    this.requestForm.patchValue({
      reference: this.request.reference,
      mission: this.request.mission,
      missionLocation: this.request.missionLocation,
      startDate: this.request.startDate,
      returnDate: this.request.returnDate,
      reimbursementMethod: this.request.reimbursementMethod
    });

    this.detailControls.clear();
    this.request.details.forEach(d => {
      this.detailControls.push(this.fb.group({
        description: [d.description, Validators.required],
        amount: [d.amount, [Validators.required, Validators.min(0.01)]],
        currencyCode: [d.currency, Validators.required]
      }));
    });
    this.recomputeTotals();
  }

  addDetail(): void {
    this.detailControls.push(this.fb.group({
      description: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      currencyCode: ['', Validators.required]
    }));
  }

  removeDetail(i: number): void {
    this.detailControls.removeAt(i);
    this.recomputeTotals();
  }

  onCurrencyChange(index: number, newCurrency: string): void {
    if (!newCurrency) return;

    // First, check if this would violate the constraint BEFORE applying
    const tempCurrencies = new Set<string>();
    this.detailControls.controls.forEach((ctrl, i) => {
      const currency = i === index ? newCurrency : ctrl.get('currencyCode')?.value;
      if (currency && currency.trim()) {
        tempCurrencies.add(currency);
      }
    });

    // Check constraint: maximum 2 different currencies
    if (tempCurrencies.size > 2) {
      this.showError('Maximum 2 different currencies allowed. Please choose from the currencies already used.');
      // Set to empty immediately to prevent any display of invalid value
      const currencyControl = this.getDetailControl(index, 'currencyCode');
      currencyControl.setValue('', { emitEvent: false }); // emitEvent: false prevents recursive calls
      this.recomputeTotals();
      return;
    }

    // Apply the change (selection is allowed)
    const currencyControl = this.getDetailControl(index, 'currencyCode');
    currencyControl.setValue(newCurrency);
    this.recomputeTotals();
  }

  trackByIndex(index: number): number {
    return index;
  }

  recomputeTotals(): void {
    this.totalAmounts = {};
    this.usedCurrencies = [];

    this.detailControls.controls.forEach(ctrl => {
      const amt = +ctrl.get('amount')?.value || 0;
      const cur = ctrl.get('currencyCode')?.value;
      if (cur) {
        this.totalAmounts[cur] = (this.totalAmounts[cur] || 0) + amt;
        if (!this.usedCurrencies.includes(cur)) {
          this.usedCurrencies.push(cur);
        }
      }
    });

    this.formattedTotals = Object.entries(this.totalAmounts)
      .map(([c, v]) => `${c} ${v.toFixed(2)}`)
      .join(', ');
  }

  

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  showSuccess(msg: string): void {
    this.alertMessage = msg;
    this.showSuccessAlert = true;
  }

  showError(msg: string): void {
    this.errorMessage = msg;
    this.showErrorAlert = true;
  }

  isFormValidForSubmission(): boolean {
    // Check if form is valid
    if (this.requestForm.invalid) {
      return false;
    }

    // Check if we have at least one valid detail
    const validDetails = this.detailControls.controls.filter(ctrl => {
      const desc = ctrl.get('description')?.value;
      const amount = ctrl.get('amount')?.value;
      const currency = ctrl.get('currencyCode')?.value;
      return desc && amount > 0 && currency;
    });

    if (validDetails.length === 0) {
      return false;
    }

    // Check currency constraint
    const usedCurrenciesSet = new Set();
    validDetails.forEach(ctrl => {
      const currency = ctrl.get('currencyCode')?.value;
      if (currency) {
        usedCurrenciesSet.add(currency);
      }
    });

    // Must not exceed 2 currencies
    return usedCurrenciesSet.size <= 2;
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
    const validDetails = this.detailControls.controls.filter(ctrl => {
      const desc = ctrl.get('description')?.value;
      const amount = ctrl.get('amount')?.value;
      const currency = ctrl.get('currencyCode')?.value;
      return desc && desc.trim() && amount > 0 && currency && currency.trim();
    });
    return validDetails.length > 0;
  }

  onUpdate(): void {
    // Validate form
    if (this.requestForm.invalid) {
      this.showError('Please fill in all required fields.');
      setTimeout(() => this.showErrorAlert = false, 5000);
      return;
    }

    // Validate details
    const validDetails = this.detailControls.controls.filter(ctrl => {
      const desc = ctrl.get('description')?.value;
      const amount = ctrl.get('amount')?.value;
      const currency = ctrl.get('currencyCode')?.value;
      return desc && amount > 0 && currency;
    });

    if (validDetails.length === 0) {
      this.showError('Please add at least one valid expense detail.');
      setTimeout(() => this.showErrorAlert = false, 5000);
      return;
    }

    // Check currency constraint
    const usedCurrenciesSet = new Set();
    validDetails.forEach(ctrl => {
      const currency = ctrl.get('currencyCode')?.value;
      if (currency) {
        usedCurrenciesSet.add(currency);
      }
    });

    if (usedCurrenciesSet.size > 2) {
      this.showError('You can only use up to 2 currencies. Please fix your expense details before updating.');
      setTimeout(() => this.showErrorAlert = false, 5000);
      return;
    }

    const raw = this.requestForm.getRawValue();
    
    // Prepare details in the correct format matching ExpenseDetails interface
    const details = raw.details.map((d: any) => ({
      description: d.description,
      amount: +d.amount,
      currency: d.currencyCode,
      currencyDescription: this.currencies.find(c => c.code === d.currencyCode)?.description || ''
    }));

    // Prepare the payload exactly matching ExpenseRequest interface
    const payload: ExpenseRequest = {
      reference: this.request.reference,
      employee: {
        reference: this.request.employee.reference
      } as Employee,
      project: {
        idProject: this.request.project.idProject
      } as Project,
      mission: raw.mission,
      missionLocation: raw.missionLocation,
      startDate: raw.startDate,
      returnDate: raw.returnDate,
      reimbursementMethod: this.request.reimbursementMethod,
      status: this.request.status,
      details: details,
      amountByCurrency: this.totalAmounts
    };

    console.log('Update payload:', JSON.stringify(payload, null, 2));
    console.log('Raw form data:', raw);
    console.log('Request details:', details);
    console.log('Used currencies:', this.usedCurrencies);
    console.log('Total amounts:', this.totalAmounts);

    this.requestService.updateExpenseRequest(this.request.idRequest!, payload).subscribe({
      next: (response) => {
        console.log('Update successful:', response);
        this.showSuccess('Request updated successfully');
        setTimeout(() => this.router.navigate(['/requests']), 2000);
      },
      error: err => {
        console.error('Update error details:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.error);
        this.showError(err.error?.message || 'Failed to update request');
        setTimeout(() => this.showErrorAlert = false, 5000);
      }
    });
  }

}