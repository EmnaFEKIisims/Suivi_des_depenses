import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Budget, BudgetType   } from './models/budget.model'; // Adjust the import path as necessary
import { History   } from './models/history.model';
import { CURRENCY_LIST } from '../request/models/expense-details.model';



export type CurrencyCode = typeof CURRENCY_LIST[number]['code'];

@Injectable({
  providedIn: 'root'
})
export class BudgetServices {
    private apiUrl = 'http://localhost:8080/api/budgets'; // base URL for your backend

  constructor(private http: HttpClient) {}

  // 🔹 Get cash budget
  getCashBudget(): Observable<Budget> {
    return this.http.get<Budget>(`${this.apiUrl}/cash`);
  }

  // 🔹 Get bank budget
  getBankBudget(): Observable<Budget> {
    return this.http.get<Budget>(`${this.apiUrl}/bank`);
  }

  // 🔹 Modify budget (always ADD operation in backend)
  modifyBudget(
    type: BudgetType,
    amount: number,
    currency: CurrencyCode,
    employeeReference: string
  ): Observable<Budget> {
    const params = new HttpParams()
      .set('amount', amount.toString())
      .set('currency', currency);

    const headers = new HttpHeaders().set('X-Employee-Reference', employeeReference);

    return this.http.post<Budget>(
      `${this.apiUrl}/${type}/operations`,
      {}, // backend expects no body, only params
      { params, headers }
    );
  }

  // 🔹 Get all history
  getHistory(): Observable<History[]> {
    return this.http.get<History[]>(`${this.apiUrl}/history`);
  }

  // 🔹 Get history filtered by budget type
  getHistoryByType(type: BudgetType): Observable<History[]> {
    return this.http.get<History[]>(`${this.apiUrl}/history/${type}`);
  }

  // 🔹 Get balance for budget type & currency
  getBalance(type: BudgetType, currency: CurrencyCode): Observable<number> {
    const params = new HttpParams()
      .set('type', type)
      .set('currency', currency);

    return this.http.get<number>(`${this.apiUrl}/balance`, { params });
  }
  
}
