import { Budget ,  BudgetType} from "../models/budget.model";
import { Employee } from "../../employee/models/employee.model";
import { ExpenseRequest } from "../../request/models/expense-request.model";
import { Project } from "../../project/models/project.model";

export interface History {
  id?: number;
  operation: Operation;        // ADD or DEDUCT
  budgetType: BudgetType;      // CASH or BANK
  employee: Employee;          // reference to employee
  amount: number;              // BigDecimal → number
  currency: string ;          // 3-letter ISO code
  operationDate: string;       // LocalDate → string (e.g. '2025-08-18')
  operationTime: string;       // LocalTime → string (e.g. '14:32:00')
  expenseRequest?: ExpenseRequest;
  project?: Project;
  budget?: Budget;
}

export enum Operation {
  ADD = 'ADD',
  DEDUCT = 'DEDUCT'
}