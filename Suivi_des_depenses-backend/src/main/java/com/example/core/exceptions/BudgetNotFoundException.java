package com.example.core.exceptions;

import com.example.core.budget.BudgetType;

public class BudgetNotFoundException extends RuntimeException {

    public BudgetNotFoundException(BudgetType type) {

        super("Budget not found for type: " + type);

    }
}
