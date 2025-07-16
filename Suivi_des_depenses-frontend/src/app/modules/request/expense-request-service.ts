import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { 
  ExpenseRequest, 
  ExpenseStatus,
  ReimbursementMethod 
} from './models/expense-request.model'; 
import { Observable } from 'rxjs';
import { ExpenseDetails } from './models/expense-details.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseRequestService {

private baseUrl = 'http://localhost:8080/api/expense-requests';

  constructor(private http: HttpClient) { }

  // ============= ExpenseRequest CRUD Operations =============
  createExpenseRequest(request: ExpenseRequest): Observable<ExpenseRequest> {
    return this.http.post<ExpenseRequest>(this.baseUrl, request);
  }

  updateExpenseRequest(id: number, request: ExpenseRequest): Observable<ExpenseRequest> {
    return this.http.put<ExpenseRequest>(`${this.baseUrl}/${id}`, request);
  }

  deleteExpenseRequest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getExpenseRequestById(id: number): Observable<ExpenseRequest> {
    return this.http.get<ExpenseRequest>(`${this.baseUrl}/${id}`);
  }

  getAllExpenseRequests(): Observable<ExpenseRequest[]> {
    return this.http.get<ExpenseRequest[]>(this.baseUrl);
  }

  // ============= ExpenseDetails Operations =============
  addExpenseDetail(requestId: number, detail: ExpenseDetails): Observable<ExpenseDetails> {
    return this.http.post<ExpenseDetails>(
      `${this.baseUrl}/${requestId}/details`, 
      detail
    );
  }

  removeExpenseDetail(detailId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/details/${detailId}`);
  }

  updateExpenseDetail(detailId: number, detail: ExpenseDetails): Observable<ExpenseDetails> {
    return this.http.put<ExpenseDetails>(
      `${this.baseUrl}/details/${detailId}`,
      detail
    );
  }

  getDetailsByRequestId(requestId: number): Observable<ExpenseDetails[]> {
    return this.http.get<ExpenseDetails[]>(`${this.baseUrl}/${requestId}/details`);
  }

  // ============= Business Operations =============
  calculateTotalAmountsByCurrency(requestId: number): Observable<Map<string, number>> {
    return this.http.get<Map<string, number>>(
      `${this.baseUrl}/${requestId}/currency-totals`
    );
  }

  submitForApproval(requestId: number): Observable<ExpenseRequest> {
    return this.http.post<ExpenseRequest>(
      `${this.baseUrl}/${requestId}/submit`,
      {}
    );
  }

  approveRequest(requestId: number, approverComments?: string): Observable<ExpenseRequest> {
    const params = approverComments ? 
      { params: { approverComments } } : 
      undefined;
      
    return this.http.post<ExpenseRequest>(
      `${this.baseUrl}/${requestId}/approve`,
      {},
      params
    );
  }

  rejectRequest(requestId: number, rejectionReason: string): Observable<ExpenseRequest> {
    return this.http.post<ExpenseRequest>(
      `${this.baseUrl}/${requestId}/reject`,
      {},
      { params: { rejectionReason } }
    );
  }

  // ============= Reporting Endpoints =============
  getRequestsByEmployee(employeeCin: string): Observable<ExpenseRequest[]> {
    return this.http.get<ExpenseRequest[]>(
      `${this.baseUrl}/by-employee/${employeeCin}`
    );
  }

  getRequestsByProject(projectId: number): Observable<ExpenseRequest[]> {
    return this.http.get<ExpenseRequest[]>(
      `${this.baseUrl}/by-project/${projectId}`
    );
  }

  getRequestsByStatus(status: ExpenseStatus): Observable<ExpenseRequest[]> {
    return this.http.get<ExpenseRequest[]>(
      `${this.baseUrl}/by-status/${status}`
    );
  }

  updateRequestStatus(requestId: number, newStatus: ExpenseStatus): Observable<any> {
  return this.http.put(`${this.baseUrl}/${requestId}/status`, { status: newStatus });
}
  
}
