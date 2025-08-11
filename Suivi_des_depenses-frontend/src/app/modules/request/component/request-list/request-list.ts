import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ExpenseRequestService } from '../../expense-request-service';
import { ExpenseRequest, ExpenseStatus , calculateTotals, getFormattedTotals } from '../../models/expense-request.model';
import { CURRENCY_LIST } from '../../models/expense-details.model';


@Component({
  selector: 'app-request-list',
  standalone: false,
  templateUrl: './request-list.html',
  styleUrl: './request-list.scss'
})
export class RequestList implements OnInit {
   expenseRequests: (ExpenseRequest & { id: number; totalAmount: number; currency: string | null })[] = [];
  filteredRequests: typeof this.expenseRequests = [];

  searchTerm: string = '';
  selectedCurrencyId: string | null = null;
  selectedStatus: string = 'ALL';

  currencies = CURRENCY_LIST;
  statuses = Object.values(ExpenseStatus);

  successMessage: string = '';
  showSuccessMessage: boolean = false;

  constructor(
    private expenseRequestService: ExpenseRequestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchRequests();
  }

  fetchRequests(): void {
    this.expenseRequestService.getAllExpenseRequests().subscribe({
      next: (requests) => {
        const updatedRequests = requests.map((req) => {
          calculateTotals(req);

          const totalAmount = Object.values(req.amountByCurrency || {}).reduce((a, b) => a + b, 0);
          const currencies = Object.keys(req.amountByCurrency || {});
          const currency = currencies.length > 0 ? currencies[0] : null;

          const id = (req as any).id ?? (req as any).idRequest;

          return {
            ...req,
            id,
            totalAmount,
            currency,
          };
        });

        this.expenseRequests = updatedRequests;
        this.applyFilters();
      },
      error: () => {
        this.expenseRequests = [];
        this.filteredRequests = [];
      }
    });
  }

  applyFilters(): void {
    const searchText = this.searchTerm.toLowerCase();

    this.filteredRequests = this.expenseRequests.filter(request => {
      const matchesSearch = !this.searchTerm ||
        request.employee?.fullName?.toLowerCase().includes(searchText) ||
        request.project?.name?.toLowerCase().includes(searchText);

      const matchesCurrency = !this.selectedCurrencyId ||
        request.details?.some(detail => detail.currency === this.selectedCurrencyId);

      const matchesStatus = this.selectedStatus === 'ALL' ||
        request.status === this.selectedStatus;

      return matchesSearch && matchesCurrency && matchesStatus;
    });
  }

  approveRequest(requestId: number): void {
    this.expenseRequestService.approveRequest(requestId).subscribe({
      next: () => {
        this.successMessage = 'Request approved successfully!';
        this.showSuccessMessage = true;
        this.fetchRequests();
        setTimeout(() => this.showSuccessMessage = false, 3000);
      },
      error: err => {
        console.error('Approval failed', err);
      }
    });
  }

  rejectRequest(requestId: number): void {
    this.expenseRequestService.rejectRequest(requestId, 'Rejected by admin').subscribe({
      next: () => {
        this.successMessage = 'Request rejected successfully!';
        this.showSuccessMessage = true;
        this.fetchRequests();
        setTimeout(() => this.showSuccessMessage = false, 3000);
      },
      error: err => {
        console.error('Rejection failed', err);
      }
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onCurrencyChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  getCurrencySymbol(code: string | undefined): string {
    if (!code) return '';
    const currency = CURRENCY_LIST.find(c => c.code === code || c.description === code);
    return currency ? currency.code : '';
  }

  formatStatus(status: ExpenseStatus): string {
    return status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ');
  }

  viewRequest(id: number): void {
    this.router.navigate(['/requests', id]);
  }

  editRequest(id: number): void {
    this.router.navigate(['/requests/edit', id]);
  }

  goToCreateExpenseRequest(): void {
    this.router.navigate(['/requests/add']);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}