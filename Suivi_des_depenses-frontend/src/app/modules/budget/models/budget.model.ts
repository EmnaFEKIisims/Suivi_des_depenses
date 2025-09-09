import { BudgetLine } from "../models/budget-line.model";


export enum BudgetType {
  CASH = 'CASH',
  BANK = 'BANK'
}

export interface Budget {
  id?: number;              
  type: BudgetType;        
  lines: BudgetLine[];      
  historyRecords: History[];
}