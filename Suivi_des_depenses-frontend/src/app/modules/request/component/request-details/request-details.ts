import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ExpenseRequestService } from '../../expense-request-service';
import { ExpenseRequest, ExpenseStatus } from '../../models/expense-request.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-request-details',
  standalone: false,
  templateUrl: './request-details.html',
  styleUrl: './request-details.scss'
})
export class RequestDetails implements OnInit {
  request!: ExpenseRequest;
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private expenseRequestService: ExpenseRequestService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.loadRequestDetails();
  }

  loadRequestDetails(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'Invalid request ID';
      this.isLoading = false;
      return;
    }

    this.expenseRequestService.getExpenseRequestById(+id).subscribe({
      next: (request) => {
        this.request = request;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load request details';
        this.isLoading = false;
        console.error('Error loading request:', err);
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  approveRequest(): void {
    if (confirm('Are you sure you want to approve this expense request?')) {
      this.updateRequestStatus(ExpenseStatus.APPROVED);
    }
  }

  rejectRequest(): void {
    if (confirm('Are you sure you want to reject this expense request?')) {
      this.updateRequestStatus(ExpenseStatus.REJECTED);
    }
  }

  private updateRequestStatus(newStatus: ExpenseStatus): void {
    this.isLoading = true;
    this.expenseRequestService.updateRequestStatus(this.request.idRequest!, newStatus).subscribe({
      next: () => {
        this.request.status = newStatus;
        this.isLoading = false;
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to update request status';
        this.isLoading = false;
        console.error('Error updating status:', err);
      }
    });
  }



  getTotalAmount(): string {
  if (!this.request.details || this.request.details.length === 0) {
    return 'N/A';
  }

  // Group amounts by currency
  const amountsByCurrency: {[key: string]: number} = {};
  
  this.request.details.forEach(detail => {
    const currency = detail.currency;
    const amount = detail.amount;
    
    if (!amountsByCurrency[currency]) {
      amountsByCurrency[currency] = 0;
    }
    amountsByCurrency[currency] += amount;
  });

  // Format as "TND 100, EUR 2200"
  return Object.entries(amountsByCurrency)
    .map(([currency, amount]) => `${currency} ${amount}`)
    .join(', ');
}



}