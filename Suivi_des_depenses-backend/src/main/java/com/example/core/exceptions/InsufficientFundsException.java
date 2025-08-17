package com.example.core.exceptions;

import com.example.core.budget.BudgetType;
import com.example.core.expenseRequest.Currency;

import java.math.BigDecimal;

public class InsufficientFundsException extends BusinessException {
    private final Currency currency;
    private final BudgetType budgetType;
    private final BigDecimal available;
    private final BigDecimal requested;

    public InsufficientFundsException(Currency currency, BudgetType type,
                                      BigDecimal available, BigDecimal requested) {
        super(String.format("Insufficient %s in %s (Available: %s, Needed: %s)",
                currency, type, available, requested));
        this.currency = currency;
        this.budgetType = type;
        this.available = available;
        this.requested = requested;
    }

    // Getters
    public Currency getCurrency() { return currency; }
    public BudgetType getBudgetType() { return budgetType; }
    public BigDecimal getAvailableAmount() { return available; }
    public BigDecimal getRequestedAmount() { return requested; }
}