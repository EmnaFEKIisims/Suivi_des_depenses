package com.example.core.budget;

import com.example.core.employee.Employee;
import com.example.core.expenseRequest.Currency;
import com.example.core.expenseRequest.ExpenseRequest;

import java.math.BigDecimal;
import java.util.List;

public interface BudgetServices {

    Budget getCashBudget();
    Budget getBankBudget();
    Budget modifyBudget(Operation operation, BudgetType type,
                        BigDecimal amount, Currency currency,
                        Employee employee, ExpenseRequest request);
    List<History> getHistory();
    List<History> getHistoryByType(BudgetType type);
    BigDecimal getBalance(BudgetType type, Currency currency); //How much money exists for a specific currency in a budget


}
