import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ExpenseRequestService } from '../../expense-request-service';
import { ExpenseRequest, ExpenseStatus } from '../../models/expense-request.model';
import { ExpenseDetails } from '../../models/expense-details.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-request-details',
  standalone: false,
  templateUrl: './request-details.html',
  styleUrls: ['../../../../shared/styles/executive-details-template.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RequestDetails implements OnInit {
  request: ExpenseRequest | null = null;
  totalsMap: Map<string, number> = new Map();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private expenseRequestService: ExpenseRequestService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadRequest(id);
      this.loadCurrencyTotals(id);
    }
  }

  loadRequest(id: number): void {
    this.expenseRequestService.getExpenseRequestById(id).subscribe({
      next: (data) => {
        this.request = data;
      },
      error: (err) => {
        console.error('Failed to load expense request:', err);
      }
    });
  }

  loadCurrencyTotals(id: number): void {
    this.expenseRequestService.calculateTotalAmountsByCurrency(id).subscribe({
      next: (totals) => {
        this.totalsMap = new Map(Object.entries(totals));
      },
      error: (err) => {
        console.error('Failed to load currency totals:', err);
      }
    });
  }

  getCurrencies(): string[] {
    return Object.keys(this.request?.amountByCurrency || {});
  }

  getTotalCurrencies(): string[] {
    return Array.from(this.totalsMap.keys());
  }

  getTotalAmount(currency: string): number {
    return this.totalsMap.get(currency) || 0;
  }

  getAmountByCurrency(detail: ExpenseDetails, currencyCode: string): number {
    if (detail.currency === currencyCode) {
      return detail.amount;
    }
    return 0;
  }

  getFormattedTotals(request: ExpenseRequest | null): string {
    if (!request || this.totalsMap.size === 0) {
      return 'Not calculated';
    }
    return Array.from(this.totalsMap.entries())
      .map(([currency, amount]) => `${currency} ${amount}`)
      .join(', ');
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  navigateToEdit(): void {
    if (this.request?.idRequest) {
      this.router.navigate(['/requests/edit', this.request.idRequest]);
    }
  }


    isEditDisabled(): boolean {
    return !this.request || this.request.status !== 'SUBMITTED';
  }

}