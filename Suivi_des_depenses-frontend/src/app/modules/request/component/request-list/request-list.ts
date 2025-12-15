import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ExpenseRequestService } from '../../expense-request-service';
import { BudgetServices } from '../../../budget/budget-services';
import { ExpenseRequest, ExpenseStatus, calculateTotals, getFormattedTotals } from '../../models/expense-request.model';
import { CURRENCY_LIST } from '../../models/expense-details.model';
import { BudgetType } from '../../../budget/models/budget.model'; 
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '../../../auth/auth-service';
import { AlertService } from '../../../../shared/services/alert.service';

// Define CurrencyCode as a union of all currency codes
type CurrencyCode = typeof CURRENCY_LIST[number]['code'];

@Component({
  selector: 'app-request-list',
  standalone: false,
  templateUrl: './request-list.html',
  styleUrls: [
    '../../../../shared/styles/executive-list-template.scss',
    './request-list.scss'
  ],
  encapsulation: ViewEncapsulation.None
})
export class RequestList implements OnInit {
  expenseRequests: (ExpenseRequest & { id: number; totalAmount: number; currency: string | null })[] = [];
  filteredRequests: typeof this.expenseRequests = [];

  searchTerm: string = '';
  selectedCurrencyId: string | null = null;
  selectedCurrencyId2: string | null = null;
  selectedStatus: string = 'ALL';

  currencies = CURRENCY_LIST;
  statuses = Object.values(ExpenseStatus);

  successMessage: string = '';
  showSuccessMessage: boolean = false;

  // Modal states
  showApprovalModal = false;
  showRejectionModal = false;
  selectedRequest: ExpenseRequest | null = null;

  constructor(
    private expenseRequestService: ExpenseRequestService,
    private budgetService: BudgetServices,
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.fetchRequests();
    this.selectedCurrencyId = ""; // Ensure "All Currencies" is default for first filter
    this.selectedCurrencyId2 = ""; // Ensure "All Currencies" is default for second filter
    this.selectedStatus = this.statuses.length > 0 ? this.statuses[0] : ""; 
  }

fetchRequests(): void {
  const isAdmin = this.authService.hasRole('ADMIN'); // From your AuthService

  if (isAdmin) {
    this.expenseRequestService.getAllExpenseRequests().subscribe({
      next: (requests) => this.processRequests(requests),
      error: () => this.handleError()
    });
  } else {
    this.expenseRequestService.getMyRequests().subscribe({
      next: (requests) => this.processRequests(requests),
      error: () => this.handleError()
    });
  }
}

// Extracted logic to avoid duplication
private processRequests(requests: ExpenseRequest[]): void {
  const updatedRequests = requests.map((req) => {
    calculateTotals(req);

    const totalAmount = Object.values(req.amountByCurrency || {}).reduce((a, b) => a + b, 0);
    const currencies = Object.keys(req.amountByCurrency || {});
    const currency = currencies.length > 0 ? currencies[0] : null;
    const id = (req as any).id ?? (req as any).idRequest;

    return { ...req, id, totalAmount, currency };
  });

  this.expenseRequests = updatedRequests;
  this.applyFilters();
}

private handleError(): void {
  this.expenseRequests = [];
  this.filteredRequests = [];
}

  // Helper to format amount: 2100.00 => 2 100, 2100.50 => 2 100.5
  formatAmount(amount: number): string {
    if (amount == null) return '';
    const rounded = Math.round(amount);
    if (amount === rounded) {
      // No decimals, format with space
      return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
    // Has decimals, keep 1 or 2 decimals
    return amount.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).replace(/,/g, ' ');
  }

  // Get all currency/amount pairs for a request
  getAmountsByCurrency(request: ExpenseRequest): Array<{currency: string, amount: number}> {
    if (!request.amountByCurrency) return [];
    return Object.entries(request.amountByCurrency).map(([currency, amount]) => ({ currency, amount }));
  }

  getApprovedAmountsByCurrency(request: ExpenseRequest): { currency: string; amount: number }[] {
    if (!request.approvedAmounts) {
      return [];
    }

    try {
      let amounts: { [key: string]: number };
      
      // Handle both string and object formats
      if (typeof request.approvedAmounts === 'string') {
        amounts = JSON.parse(request.approvedAmounts);
      } else {
        amounts = request.approvedAmounts;
      }

      return Object.entries(amounts).map(([currency, amount]) => ({
        currency,
        amount: Number(amount)
      }));
    } catch (error) {
      console.error('Failed to parse approved amounts:', error);
      return [];
    }
  }

  applyFilters(): void {
    const searchText = this.searchTerm.toLowerCase();

    this.filteredRequests = this.expenseRequests.filter(request => {
      const matchesSearch = !this.searchTerm ||
        request.employee?.fullName?.toLowerCase().includes(searchText) ||
        request.project?.name?.toLowerCase().includes(searchText);

      // Both currency filters
      const matchesCurrency1 = !this.selectedCurrencyId || request.details?.some(detail => detail.currency === this.selectedCurrencyId);
      const matchesCurrency2 = !this.selectedCurrencyId2 || request.details?.some(detail => detail.currency === this.selectedCurrencyId2);

      const matchesStatus = this.selectedStatus === 'ALL' || request.status === this.selectedStatus; // Match "ALL" or selected status

      return matchesSearch && matchesCurrency1 && matchesCurrency2 && matchesStatus;
    });
  }

  approveRequest(requestId: number): void {
    // Check if user has admin permissions
    if (!this.isAdmin()) {
      this.alertService.showAccessDenied(
        'Only administrators can approve expense requests.'
      );
      return;
    }

    const request = this.expenseRequests.find(r => r.id === requestId);
    if (!request || request.status !== 'SUBMITTED') {
      this.triggerSweetAlert('error', 'Approval is only allowed for SUBMITTED requests.');
      return;
    }

    // Open approval modal instead of direct approval
    this.selectedRequest = request;
    this.showApprovalModal = true;
  }

  rejectRequest(requestId: number): void {
    // Check if user has admin permissions
    if (!this.isAdmin()) {
      this.alertService.showAccessDenied(
        'Only administrators can reject expense requests.'
      );
      return;
    }

    const request = this.expenseRequests.find(r => r.id === requestId);
    if (!request || request.status !== 'SUBMITTED') {
      this.triggerSweetAlert('error', 'Rejection is only allowed for SUBMITTED requests.');
      return;
    }

    // Open rejection modal instead of direct rejection
    this.selectedRequest = request;
    this.showRejectionModal = true;
  }

  // Modal event handlers
  onApprovalCompleted(): void {
    this.showApprovalModal = false;
    this.selectedRequest = null;
    this.fetchRequests(); // Reload data
  }

  onApprovalCancelled(): void {
    this.showApprovalModal = false;
    this.selectedRequest = null;
  }

  onRejectionCompleted(): void {
    this.showRejectionModal = false;
    this.selectedRequest = null;
    this.fetchRequests(); // Reload data
  }

  onRejectionCancelled(): void {
    this.showRejectionModal = false;
    this.selectedRequest = null;
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
    const request = this.expenseRequests.find(r => r.id === id);
    if (!request || request.status !== 'SUBMITTED') {
      this.triggerSweetAlert('error', 'Editing is only allowed for SUBMITTED requests.');
      return;
    }
    this.router.navigate(['/requests/edit', id]);
  }

  goToCreateExpenseRequest(): void {
    this.router.navigate(['/requests/add']);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
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
          const title = document.querySelector('.swal-title');
          if (title) {
            const titleElement = title as HTMLElement;
            titleElement.style.color = type === 'success' ? 'var(--emerald)' : 'var(--ruby)';
            titleElement.style.fontFamily = "'Playfair Display', serif";
            titleElement.style.fontSize = '1.5rem';
          }
        }
      }
    };

    Swal.fire(swalConfig).then((result) => {
      if (result.isConfirmed && type === 'success') {
        // No navigation needed here, just refresh the list
      }
    });
  }

  // Helper method to check budget availability for up to two currencies
  private async checkBudgetAvailability(request: ExpenseRequest): Promise<{ message: string } | null> {
    const currencyAmounts = Object.entries(request.amountByCurrency || {}).slice(0, 2); // Limit to max 2 currencies
    if (currencyAmounts.length === 0) return null;

    const balanceChecks = currencyAmounts.map(([currency, requiredAmount]) =>
      Promise.all([BudgetType.CASH, BudgetType.BANK].map(type =>
        lastValueFrom(this.budgetService.getBalance(type, currency as CurrencyCode))
          .then(availableAmount => ({ type, currency, requiredAmount, availableAmount }))
          .catch(err => {
            console.error(`Error checking balance for ${type} ${currency}:`, err);
            return { type, currency, requiredAmount, availableAmount: 0 };
          })
      ))
    );

    const results = await Promise.all(balanceChecks);
    const insufficientCurrencies: string[] = [];

    for (const [index, checks] of results.entries()) {
      const currency = currencyAmounts[index][0];
      const sufficient = checks.some(check => check.availableAmount >= check.requiredAmount);
      if (!sufficient) {
        insufficientCurrencies.push(currency);
      }
    }

    if (insufficientCurrencies.length > 0) {
      const message = insufficientCurrencies.length === 1
        ? `Currency ${this.currencies.find(c => c.code === insufficientCurrencies[0])?.description || 'Unknown'} "${insufficientCurrencies[0]}" is not available.`
        : `Currencies ${insufficientCurrencies.map(c => `${this.currencies.find(cc => cc.code === c)?.description || 'Unknown'} "${c}"`).join(' and ')} are not available.`;
      return { message };
    }
    return null; // Both currencies have sufficient funds in at least one type
  }

  // Helper method to check if user is admin
  isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  // Helper method to check if request was created by current user
  isRequestCreatedByCurrentUser(request: ExpenseRequest): boolean {
    const currentUserEmail = this.authService.getEmail();
    return !!(currentUserEmail && request.employee.email === currentUserEmail);
  }
}