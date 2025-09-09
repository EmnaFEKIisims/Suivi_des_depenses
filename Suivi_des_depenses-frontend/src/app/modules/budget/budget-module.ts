import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BudgetRoutingModule } from './budget-routing-module';
import { BudgetList } from './components/budget-list/budget-list';
import { HistoryList } from './components/history-list/history-list';
import { CreateBudgetLine } from './components/create-budget-line/create-budget-line';


@NgModule({
  declarations: [
    // Only non-standalone components here
  ],
  imports: [
    CommonModule,
    BudgetRoutingModule,
    BudgetList,
    HistoryList,
    CreateBudgetLine,
    FormsModule
  ]
})
export class BudgetModule { }
