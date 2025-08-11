import { Injectable } from '@angular/core';
import { HttpClient , HttpParams} from '@angular/common/http';
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

  constructor(private http: HttpClient) {}

  // ========== CRUD Operations ==========

  createExpenseRequest(request: ExpenseRequest): Observable<ExpenseRequest> {
    return this.http.post<ExpenseRequest>(`${this.baseUrl}/createExpenseRequest`, request);
  }

  updateExpenseRequest(id: number, request: ExpenseRequest): Observable<ExpenseRequest> {
    return this.http.put<ExpenseRequest>(`${this.baseUrl}/updateExpenseRequest/${id}`, request);
  }

  getExpenseRequestById(id: number): Observable<ExpenseRequest> {
    return this.http.get<ExpenseRequest>(`${this.baseUrl}/getExpenseRequestById/${id}`);
  }

  getAllExpenseRequests(): Observable<ExpenseRequest[]> {
    return this.http.get<ExpenseRequest[]>(this.baseUrl);
  }

  // ========== Expense Details ==========

  addExpenseDetail(requestId: number, detail: ExpenseDetails): Observable<ExpenseDetails> {
    return this.http.post<ExpenseDetails>(`${this.baseUrl}/details/addExpenseDetail/${requestId}`, detail);
  }

  removeExpenseDetail(detailId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/details/removeExpenseDetail/${detailId}`);
  }

  updateExpenseDetail(detailId: number, detail: ExpenseDetails): Observable<ExpenseDetails> {
    return this.http.put<ExpenseDetails>(`${this.baseUrl}/details/updateExpenseDetail/${detailId}`, detail);
  }

  getDetailsByRequestId(requestId: number): Observable<ExpenseDetails[]> {
    return this.http.get<ExpenseDetails[]>(`${this.baseUrl}/details/getDetailsByRequestId/${requestId}`);
  }

  // ========== Business Operations ==========

  calculateTotalAmountsByCurrency(requestId: number): Observable<Map<string, number>> {
    return this.http.get<Map<string, number>>(`${this.baseUrl}/${requestId}/currency-totals`);
  }

  approveRequest(requestId: number, approverComments?: string): Observable<ExpenseRequest> {
    let params = new HttpParams();
    if (approverComments) {
      params = params.set('approverComments', approverComments);
    }
    return this.http.post<ExpenseRequest>(`${this.baseUrl}/${requestId}/approve`, {}, { params });
  }

  rejectRequest(requestId: number, rejectionReason: string): Observable<ExpenseRequest> {
    const params = new HttpParams().set('rejectionReason', rejectionReason);
    return this.http.post<ExpenseRequest>(`${this.baseUrl}/${requestId}/reject`, {}, { params });
  }

  // ========== Filters ==========

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

  // ========== Utility Methods ==========

  generateReference(): Observable<string> {
    return this.http.get(`${this.baseUrl}/generate-reference`, { responseType: 'text' });
  }

  // ========== Enum Support Methods (Optional UI Helpers) ==========

  getAllExpenseStatuses(): ExpenseStatus[] {
    return Object.values(ExpenseStatus);
  }

  getAllReimbursementMethods(): ReimbursementMethod[] {
    return Object.values(ReimbursementMethod);
  }


  
}
