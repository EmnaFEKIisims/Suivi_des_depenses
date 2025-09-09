import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BudgetServices } from '../../budget-services';
import { getCurrencyDescription, CURRENCY_LIST } from '../../../request/models/expense-details.model';
import { BudgetType, Budget } from '../../models/budget.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-budget-list',
  templateUrl: './budget-list.html',
  styleUrls: ['./budget-list.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe]
})
export class BudgetList implements OnInit {
  BudgetType = BudgetType;
  selectedBudgetType: BudgetType = BudgetType.CASH;
  selectedCurrency: string = '';
  searchTerm: string = '';
  currencyList = CURRENCY_LIST;
  budgetLines: any[] = [];
  filteredBudgetLines: any[] = [];

  constructor(private budgetService: BudgetServices, private router: Router) {}

  ngOnInit(): void {
    this.loadBudgetLines();
  }

  loadBudgetLines(): void {
    if (this.selectedBudgetType === BudgetType.CASH) {
      this.budgetService.getCashBudget().subscribe((budget: Budget) => {
        this.budgetLines = budget.lines;
        this.applyFilters();
      });
    } else {
      this.budgetService.getBankBudget().subscribe((budget: Budget) => {
        this.budgetLines = budget.lines;
        this.applyFilters();
      });
    }
  }

  onBudgetTypeChange(type: BudgetType): void {
    this.selectedBudgetType = type;
    this.loadBudgetLines();
  }

  onCurrencyChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredBudgetLines = this.budgetLines.filter(line => {
      const matchesCurrency = !this.selectedCurrency || line.currency === this.selectedCurrency;
      const desc = getCurrencyDescription(line.currency);
      const matchesSearch = !this.searchTerm ||
        line.currency.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        desc.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCurrency && matchesSearch;
    });
  }

  getCurrencyDescription(code: string): string {
    return getCurrencyDescription(code);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  showHistory(): void {
    this.navigateTo('/budget/history');
  }

  // Add this method inside the export class BudgetList { ... }
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
}
