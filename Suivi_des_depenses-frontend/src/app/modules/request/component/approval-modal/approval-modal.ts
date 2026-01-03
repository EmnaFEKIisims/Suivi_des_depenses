import { Component, EventEmitter, Input, OnInit, OnChanges, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpenseRequest } from '../../models/expense-request.model';
import { ExpenseDetails, CURRENCY_LIST } from '../../models/expense-details.model';
import { ExpenseRequestService } from '../../expense-request-service';
import { AlertService } from '../../../../shared/services/alert.service';

@Component({
  selector: 'app-approval-modal',
  standalone: false,
  templateUrl: './approval-modal.html',
  styleUrls: ['./approval-modal.scss']
})
export class ApprovalModal implements OnInit, OnChanges {
  @Input() request: ExpenseRequest | null = null;
  @Input() visible: boolean = false;
  @Output() approved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  approvalForm!: FormGroup;
  currencies = CURRENCY_LIST;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private expenseRequestService: ExpenseRequestService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(): void {
    if (this.request && this.visible) {
      this.loadRequestData();
    }
  }

  private initForm(): void {
    this.approvalForm = this.fb.group({
      approvalComment: [''],
      details: this.fb.array([])
    });
  }

  private loadRequestData(): void {
    if (!this.request) return;

    // Clear existing details
    const detailsArray = this.approvalForm.get('details') as FormArray;
    detailsArray.clear();

    // Load current details
    if (this.request.details && this.request.details.length > 0) {
      this.request.details.forEach(detail => {
        detailsArray.push(this.createDetailForm(detail));
      });
    } else {
      // If no details exist, add one empty detail for editing
      const emptyDetail: ExpenseDetails = {
        amount: 0,
        description: '',
        currency: 'EUR'
      };
      detailsArray.push(this.createDetailForm(emptyDetail));
    }
  }

  private createDetailForm(detail: ExpenseDetails): FormGroup {
    return this.fb.group({
      id: [detail.id || null],
      amount: [Number(detail.amount) || 0, [Validators.required, Validators.min(0.01)]],
      description: [detail.description || '', Validators.required],
      currency: [detail.currency || 'EUR', Validators.required]
    });
  }

  get detailsArray(): FormArray {
    return this.approvalForm.get('details') as FormArray;
  }

  removeDetail(index: number): void {
    this.detailsArray.removeAt(index);
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  async onApprove(): Promise<void> {
    if (!this.request || !this.approvalForm.valid) {
      this.alertService.showError('Please fill in all required fields correctly.');
      return;
    }

    this.isLoading = true;

    try {
      const approvalComment = this.approvalForm.get('approvalComment')?.value || '';
      const formDetails = this.detailsArray.value.filter((detail: any) => 
        detail.amount > 0 && detail.description.trim()
      );

      // Create approved amounts JSON object with the admin's approved values from the form
      const approvedAmounts: { [key: string]: number } = {};
      formDetails.forEach((detail: any) => {
        const currency = detail.currency;
        const amount = Number(detail.amount);
        approvedAmounts[currency] = (approvedAmounts[currency] || 0) + amount;
      });

      // Send the approval data with comment and approved amounts
      const approvalData = {
        comment: approvalComment,
        approvedAmounts: approvedAmounts
      };

      await this.expenseRequestService.approveRequest(this.request.idRequest!, approvalData).toPromise();

      this.isLoading = false;
      this.alertService.showSuccess('Request approved successfully!');
      this.approved.emit();
    } catch (error: any) {
      this.isLoading = false;
      
      if (error.status === 403) {
        this.alertService.showError('Access denied. You may not have sufficient permissions to approve this request.');
      } else if (error.status === 401) {
        this.alertService.showError('Authentication failed. Please log in again.');
      } else {
        this.alertService.showError(error.error?.message || 'Failed to approve request. Please try again.');
      }
    }
  }

  getTotalByCategory(): { [key: string]: number } {
    const totals: { [key: string]: number } = {};
    
    this.detailsArray.controls.forEach(control => {
      const currency = control.get('currency')?.value;
      const amount = control.get('amount')?.value || 0;
      totals[currency] = (totals[currency] || 0) + amount;
    });
    
    return totals;
  }

  getCurrencySymbol(code: string): string {
    const currency = this.currencies.find(c => c.code === code);
    return currency ? currency.code : code;
  }
}
