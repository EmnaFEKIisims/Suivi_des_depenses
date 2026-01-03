import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExpenseRequest, ExpenseStatus, ReimbursementMethod } from './models/expense-request.model';
import { ExpenseDetails } from './models/expense-details.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseRequestService {

  private baseUrl = 'http://localhost:8080/api/expense-requests';

  constructor(private http: HttpClient) { }

  // CREATE - FIXED: was /createExpenseRequest → now /create
  createExpenseRequest(request: ExpenseRequest): Observable<ExpenseRequest> {
    return this.http.post<ExpenseRequest>(`${this.baseUrl}/create`, request);
  }

  // UPDATE - You already had this correct
  updateExpenseRequest(id: number, request: ExpenseRequest): Observable<ExpenseRequest> {
    return this.http.put<ExpenseRequest>(`${this.baseUrl}/update/${id}`, request);
  }

  // GET BY ID
  getExpenseRequestById(id: number): Observable<ExpenseRequest> {
    return this.http.get<ExpenseRequest>(`${this.baseUrl}/${id}`);
  }

  // GET ALL (Admin only)
  getAllExpenseRequests(): Observable<ExpenseRequest[]> {
    return this.http.get<ExpenseRequest[]>(this.baseUrl);
  }

  // GET MY REQUESTS
  getMyRequests(): Observable<ExpenseRequest[]> {
    return this.http.get<ExpenseRequest[]>(`${this.baseUrl}/my-requests`);
  }

  // ADD DETAIL
  addExpenseDetail(requestId: number, detail: ExpenseDetails): Observable<ExpenseDetails> {
    return this.http.post<ExpenseDetails>(`${this.baseUrl}/details/add/${requestId}`, detail);
  }

  // UPDATE DETAIL
  updateExpenseDetail(detailId: number, detail: ExpenseDetails): Observable<ExpenseDetails> {
    return this.http.put<ExpenseDetails>(`${this.baseUrl}/details/update/${detailId}`, detail);
  }

  // REMOVE DETAIL
  removeExpenseDetail(detailId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/details/remove/${detailId}`);
  }

  // APPROVE
  approveRequest(requestId: number, approvalData: { comment?: string; approvedAmounts?: { [key: string]: number } } = {}): Observable<ExpenseRequest> {
    return this.http.post<ExpenseRequest>(`${this.baseUrl}/${requestId}/approve`, approvalData);
  }

  // REJECT
  rejectRequest(requestId: number, rejectionData: { reason: string }): Observable<ExpenseRequest> {
    return this.http.post<ExpenseRequest>(`${this.baseUrl}/${requestId}/reject`, rejectionData);
  }

  // GET DETAILS BY REQUEST ID
  getDetailsByRequestId(requestId: number): Observable<ExpenseDetails[]> {
    return this.http.get<ExpenseDetails[]>(`${this.baseUrl}/details/${requestId}`);
  }

  // GET TOTALS BY CURRENCY
  calculateTotalAmountsByCurrency(requestId: number): Observable<Map<string, number>> {
    return this.http.get<Map<string, number>>(`${this.baseUrl}/${requestId}/totals`);
  }

  // FILTERS
  getRequestsByEmployee(employeeCin: string): Observable<ExpenseRequest[]> {
    return this.http.get<ExpenseRequest[]>(`${this.baseUrl}/by-employee/${employeeCin}`);
  }

  getRequestsByProject(projectId: number): Observable<ExpenseRequest[]> {
    return this.http.get<ExpenseRequest[]>(`${this.baseUrl}/by-project/${projectId}`);
  }

  getRequestsByStatus(status: ExpenseStatus): Observable<ExpenseRequest[]> {
    return this.http.get<ExpenseRequest[]>(`${this.baseUrl}/by-status/${status}`);
  }

  getRequestsByCurrency(currency: string): Observable<ExpenseRequest[]> {
    return this.http.get<ExpenseRequest[]>(`${this.baseUrl}/by-currency/${currency}`);
  }

  // GENERATE REFERENCE
  generateReference(): Observable<string> {
    return this.http.get(`${this.baseUrl}/generate-reference`, { responseType: 'text' });
  }

  // ENUM HELPERS
  getAllExpenseStatuses(): ExpenseStatus[] {
    return Object.values(ExpenseStatus);
  }

  getAllReimbursementMethods(): ReimbursementMethod[] {
    return Object.values(ReimbursementMethod);
  }
}