import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseRequestService } from '../../expense-request-service';
import { ExpenseRequest, ExpenseStatus, ReimbursementMethod } from '../../models/expense-request.model';
import { Project } from '../../../project/models/project.model';
import { Employee } from '../../../employee/models/employee.model';
import { CURRENCY_LIST } from '../../models/expense-details.model';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-update-request',
  standalone: false,
  templateUrl: './update-request.html',
  styleUrls: ['./update-request.scss', '../create-request/total-amounts-styles.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UpdateRequest implements OnInit {
  requestForm!: FormGroup;
  request$: Observable<ExpenseRequest> = of();
  request: ExpenseRequest | null = null;
  loading = true;

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

  @ViewChild('successAlert') successAlert!: ElementRef;
  @ViewChild('errorAlert') errorAlert!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private requestService: ExpenseRequestService
  ) {}

  ngOnInit(): void {
    this.request$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = +params.get('id')!; // Convert id to number
        return this.requestService.getExpenseRequestById(id); // Use id-based method
      })
    );

    this.request$.subscribe({
      next: req => {
        this.request = req;
        this.loading = false;
        this.initializeForm();
        console.log('Request loaded:', { id: req.idRequest, status: req.status });
      },
      error: err => {
        this.loading = false;
        this.triggerSweetAlert('error', err.error?.message || 'Failed to load request.');
        console.error('Error loading request:', err);
      }
    });

    this.requestForm = this.fb.group({
      reference: ['', Validators.required],
      mission: ['', Validators.required],
      missionLocation: ['', Validators.required],
      startDate: ['', Validators.required],
      returnDate: ['', Validators.required],
      reimbursementMethod: [''],
      details: this.fb.array([])
    });
  }

  initializeForm(): void {
    if (!this.request) return;

    this.requestForm.patchValue({
      reference: this.request.reference,
      mission: this.request.mission,
      missionLocation: this.request.missionLocation,
      startDate: this.request.startDate,
      returnDate: this.request.returnDate,
      reimbursementMethod: this.request.reimbursementMethod
    });

    this.requestForm.get('reference')?.disable();
    this.requestForm.get('reimbursementMethod')?.disable();

    const detailsArray = this.requestForm.get('details') as FormArray;
    detailsArray.clear();
    if (this.request.details) {
      this.request.details.forEach(d => {
        detailsArray.push(this.fb.group({
          description: [d.description, Validators.required],
          amount: [d.amount, [Validators.required, Validators.min(0.01)]],
          currencyCode: [d.currency, Validators.required]
        }));
      });
    }
    this.recomputeTotals();
    console.log('Form initialized:', {
      reference: this.requestForm.get('reference')?.value,
      mission: this.requestForm.get('mission')?.value,
      details: this.detailControls.controls.map(c => c.value)
    });
    this.logValidationState();
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

    const tempCurrencies = new Set<string>();
    this.detailControls.controls.forEach((ctrl, i) => {
      const currency = i === index ? newCurrency : ctrl.get('currencyCode')?.value;
      if (currency && currency.trim()) tempCurrencies.add(currency);
    });

    if (tempCurrencies.size > 2) {
      this.triggerSweetAlert('error', 'Maximum 2 different currencies allowed. Please choose from the currencies already used.');
      const currencyControl = this.getDetailControl(index, 'currencyCode');
      currencyControl.setValue('', { emitEvent: false });
      this.recomputeTotals();
      return;
    }

    const currencyControl = this.getDetailControl(index, 'currencyCode');
    currencyControl.setValue(newCurrency);
    this.recomputeTotals();
  }

  recomputeTotals(): void {
    this.totalAmounts = {};
    this.usedCurrencies = [];

    this.detailControls.controls.forEach(ctrl => {
      const amt = +ctrl.get('amount')?.value || 0;
      const cur = ctrl.get('currencyCode')?.value;
      if (cur) {
        this.totalAmounts[cur] = (this.totalAmounts[cur] || 0) + amt;
        if (!this.usedCurrencies.includes(cur)) this.usedCurrencies.push(cur);
      }
    });

    this.formattedTotals = Object.entries(this.totalAmounts)
      .map(([c, v]) => `${c}: ${this.formatted(v)}`)
      .join(', ');
  }

  formatted(amount: number): string {
    if (amount == null) return '';
    const rounded = Math.round(amount * 100) / 100;
    const [integerPart, decimalPart = '00'] = rounded.toString().split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return decimalPart === '00' ? `${formattedInteger}` : `${formattedInteger}.${decimalPart}`;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  triggerSweetAlert(type: 'success' | 'error', message: string): void {
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
            titleElement.style.fontFamily = "'Playfair Display', serif' ";
            titleElement.style.fontSize = '1.5rem';
          }
        }
      }
    };

    Swal.fire(swalConfig).then(() => {
      if (type === 'success') {
        this.router.navigate(['/requests']);
      }
      this.showSuccessAlert = type === 'success';
      this.showErrorAlert = type === 'error';
      this.alertMessage = type === 'success' ? message : '';
      this.errorMessage = type === 'error' ? message : '';
    });
  }

  isFormValidForSubmission(): boolean {
    const formValid = this.requestForm.valid;
    const detailsValid = this.detailControls.controls.every((ctrl, index) => {
      const desc = ctrl.get('description')?.value;
      const amount = ctrl.get('amount')?.value;
      const currency = ctrl.get('currencyCode')?.value;
      const isValid = desc && amount > 0 && currency;
      if (!isValid) {
        console.log(`Invalid detail at index ${index}:`, { desc: desc || 'undefined', amount: amount || 'undefined', currency: currency || 'undefined' });
      }
      return isValid;
    });
    const currencyLimit = new Set(this.detailControls.controls.map(ctrl => ctrl.get('currencyCode')?.value)).size <= 2;
    const result = formValid && !this.loading && !!this.request && detailsValid && currencyLimit;
    console.log(`Form validity check: formValid=${formValid}, loading=${this.loading}, requestLoaded=${!!this.request}, detailsValid=${detailsValid}, currencyLimit=${currencyLimit}, detailCount=${this.detailControls.length}, result=${result}`);
    return result;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.requestForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.requestForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
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

  getCurrencyDescription(code: string): string {
    const currency = this.currencies.find(c => c.code === code);
    return currency ? currency.description : code;
  }

  onUpdate(): void {
    console.log('onUpdate called', this.requestForm.value);
    if (this.requestForm.invalid || this.loading || !this.request) {
      this.triggerSweetAlert('error', 'Please fill in all required fields or wait for data to load.');
      return;
    }

    const validDetails = this.detailControls.controls.filter(ctrl => {
      const desc = ctrl.get('description')?.value;
      const amount = ctrl.get('amount')?.value;
      const currency = ctrl.get('currencyCode')?.value;
      return desc && amount > 0 && currency;
    });

    if (validDetails.length === 0) {
      this.triggerSweetAlert('error', 'Please add at least one valid expense detail.');
      return;
    }

    const usedCurrenciesSet = new Set();
    validDetails.forEach(ctrl => {
      const currency = ctrl.get('currencyCode')?.value;
      if (currency) usedCurrenciesSet.add(currency);
    });

    if (usedCurrenciesSet.size > 2) {
      this.triggerSweetAlert('error', 'Maximum 2 different currencies allowed.');
      return;
    }

    // Match backend fields, exclude employee and project
    const payload = {
      reference: this.request.reference,
      mission: this.requestForm.get('mission')?.value,
      missionLocation: this.requestForm.get('missionLocation')?.value,
      startDate: this.requestForm.get('startDate')?.value,
      returnDate: this.requestForm.get('returnDate')?.value,
      reimbursementMethod: this.requestForm.get('reimbursementMethod')?.value || this.request.reimbursementMethod,
      status: this.requestForm.get('status')?.value || this.request.status,
      employee: this.request.employee,
      project: this.request.project,
      details: validDetails.map((ctrl, index) => ({
        description: ctrl.get('description')?.value,
        amount: ctrl.get('amount')?.value,
        currency: ctrl.get('currencyCode')?.value,
        id: this.request?.details[index]?.id // Use undefined if not present
      }))
    };
    console.log('Payload sent to server:', JSON.stringify(payload, null, 2)); // Log full payload

    this.loading = true;
    this.requestService.updateExpenseRequest(this.request.idRequest!, payload).subscribe({
      next: (response) => {
        console.log('Update successful:', response);
        this.triggerSweetAlert('success', 'Request updated successfully');
      },
      error: err => {
        console.error('Update failed:', err);
        this.triggerSweetAlert('error', err.error?.message || 'Failed to update request. Check server logs for details.');
        this.loading = false; // Reset loading on error
      },
      complete: () => {
        this.loading = false; // Reset loading on completion
      }
    });
  }

  logSubmission(): void {
    console.log('Form submitted');
  }

  private logValidationState(): void {
    const formValid = this.requestForm.valid;
    const detailsValid = this.detailControls.controls.every((ctrl, index) => {
      const desc = ctrl.get('description')?.value;
      const amount = ctrl.get('amount')?.value;
      const currency = ctrl.get('currencyCode')?.value;
      const isValid = desc && amount > 0 && currency;
      if (!isValid) {
        console.log(`Invalid detail at index ${index}:`, { desc: desc || 'undefined', amount: amount || 'undefined', currency: currency || 'undefined' });
      }
      return isValid;
    });
    const currencyLimit = new Set(this.detailControls.controls.map(ctrl => ctrl.get('currencyCode')?.value)).size <= 2;
    const result = formValid && !this.loading && !!this.request && detailsValid && currencyLimit;
    console.log(`Initial form validity check: formValid=${formValid}, loading=${this.loading}, requestLoaded=${!!this.request}, detailsValid=${detailsValid}, currencyLimit=${currencyLimit}, detailCount=${this.detailControls.length}, result=${result}`);
  }
}