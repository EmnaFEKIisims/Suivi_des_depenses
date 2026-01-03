import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpenseRequest } from '../../models/expense-request.model';
import { ExpenseRequestService } from '../../expense-request-service';
import { AlertService } from '../../../../shared/services/alert.service';

@Component({
  selector: 'app-rejection-modal',
  standalone: false,
  templateUrl: './rejection-modal.html',
  styleUrls: ['./rejection-modal.scss']
})
export class RejectionModal {
  @Input() request: ExpenseRequest | null = null;
  @Input() visible: boolean = false;
  @Output() rejected = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  rejectionForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private expenseRequestService: ExpenseRequestService,
    private alertService: AlertService
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.rejectionForm = this.fb.group({
      rejectionReason: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onCancel(): void {
    this.rejectionForm.reset();
    this.cancelled.emit();
  }

  onReject(): void {
    if (!this.request || !this.rejectionForm.valid) {
      this.alertService.showError('Please provide a detailed rejection reason (minimum 10 characters).');
      return;
    }

    this.isLoading = true;
    const rejectionReason = this.rejectionForm.get('rejectionReason')?.value;

    this.expenseRequestService.rejectRequest(this.request.idRequest!, {
      reason: rejectionReason
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.alertService.showSuccess('Request rejected successfully.');
        this.rejectionForm.reset();
        this.rejected.emit();
      },
      error: (error) => {
        this.isLoading = false;
        this.alertService.showError(error.error?.message || 'Failed to reject request.');
      }
    });
  }

  get rejectionReason() {
    return this.rejectionForm.get('rejectionReason');
  }
}
