import { ExpenseDetails } from './expense-details.model';
import { Employee } from '../../employee/models/employee.model';
import { Project } from '../../project/models/project.model';

export enum ExpenseStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PROCESSED = 'PROCESSED'
}

export enum ReimbursementMethod {
  CASH_DESK = 'Cash Desk',
  AVA = 'AVA'
}

export interface ExpenseRequest {
  idRequest?: number;
  employee: Employee;
  project: Project;
  startDate: string;   
  returnDate: string;
  mission: string;
  missionLocation: string;
  reimbursementMethod: ReimbursementMethod;
  status: ExpenseStatus;
  details: ExpenseDetails[];
  amountByCurrency?: { [key: string]: number };
}

// Utility functions
export function calculateTotals(request: ExpenseRequest): void {
  request.amountByCurrency = {};
  if (request.details) {
    request.details.forEach(detail => {
      const currency = detail.currency;
      const amount = detail.amount;
      request.amountByCurrency![currency] = (request.amountByCurrency![currency] || 0) + amount;
    });
  }
}

export function getFormattedTotals(request: ExpenseRequest): string {
  if (!request.amountByCurrency) {
    calculateTotals(request);
  }
  return Object.entries(request.amountByCurrency || {})
    .map(([currency, amount]) => `${currency} ${amount}`)
    .join(', ');
}

