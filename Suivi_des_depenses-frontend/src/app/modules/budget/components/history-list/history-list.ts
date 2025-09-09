import { Component, OnInit } from '@angular/core';
import { BudgetServices } from '../../budget-services';
import { EmployeeService } from '../../../employee/employee-service';
import { Router } from '@angular/router';
import { CURRENCY_LIST, getCurrencyDescription } from '../../../request/models/expense-details.model';
import { History } from '../../models/history.model';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-history-list',
  templateUrl: './history-list.html',
  styleUrls: ['./history-list.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe]
})
export class HistoryList implements OnInit {
  currencyList = CURRENCY_LIST;
  employeeList: any[] = [];
  historyRecords: History[] = [];
  filteredHistory: History[] = [];

  selectedCurrency: string = '';
  selectedEmployee: string = '';
  selectedType: string = '';
  selectedOperation: string = '';

  constructor(
    private budgetService: BudgetServices,
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadHistory();
  }

  loadEmployees(): void {
    this.employeeService.getAllEmployees().subscribe((data) => {
      this.employeeList = data;
    });
  }

  loadHistory(): void {
    this.budgetService.getHistory().subscribe((data) => {
      this.historyRecords = data;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    this.filteredHistory = this.historyRecords.filter(record => {
      const matchesCurrency = !this.selectedCurrency || record.currency === this.selectedCurrency;
      const matchesEmployee = !this.selectedEmployee || record.employee?.reference === this.selectedEmployee;
      const matchesType = !this.selectedType || record.budgetType === this.selectedType;
      const matchesOperation = !this.selectedOperation || record.operation === this.selectedOperation;
      return matchesCurrency && matchesEmployee && matchesType && matchesOperation;
    });
  }

  getCurrencyDescription(code: string): string {
    return getCurrencyDescription(code);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  formatAmount(amount: number, currency: string): string {
    if (amount == null) return '-';
    // Remove decimals, format with space as thousands separator
    const rounded = Math.round(amount);
    return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ' + currency;
  }
}
