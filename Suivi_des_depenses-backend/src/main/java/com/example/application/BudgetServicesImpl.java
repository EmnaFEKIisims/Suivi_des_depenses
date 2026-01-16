package com.example.application;

import com.example.core.budget.*;
import com.example.core.employee.Employee;
import com.example.core.exceptions.*;
import com.example.core.expenseRequest.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;



@Service
@Transactional
public class BudgetServicesImpl implements BudgetServices {

    private final BudgetRepoPort budgetRepoPort;
    private final HistoryRepoPort historyRepoPort;

    public BudgetServicesImpl(BudgetRepoPort budgetRepoPort, HistoryRepoPort historyRepoPort) {
        this.budgetRepoPort = budgetRepoPort;
        this.historyRepoPort = historyRepoPort;
    }

    @Override
    public Budget getCashBudget() {
        return budgetRepoPort.findByType(BudgetType.CASH)
                .orElseThrow(() -> new BudgetNotFoundException(BudgetType.CASH));
    }

    @Override
    public Budget getBankBudget() {
        return budgetRepoPort.findByType(BudgetType.BANK)
                .orElseThrow(() -> new BudgetNotFoundException(BudgetType.BANK));
    }

    @Override
    public Budget modifyBudget(Operation operation, BudgetType type,
                               BigDecimal amount, Currency currency,
                               Employee employee, ExpenseRequest request) {

        // Validate amount
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }

        Budget budget = budgetRepoPort.findByType(type)
                .orElseThrow(() -> new BudgetNotFoundException(type));

        // Find or create budget line
        Optional<BudgetLine> lineOpt = budget.getLines().stream()
                .filter(l -> l.getCurrency() == currency)
                .findFirst();

        BudgetLine line = lineOpt.orElseGet(() -> {
            BudgetLine newLine = new BudgetLine();
            newLine.setCurrency(currency);
            newLine.setAmount(BigDecimal.ZERO);
            newLine.setCurrencyDescription(currency.getDescription());
            budget.getLines().add(newLine);
            return newLine;
        });

        // Apply operation with validation
        switch (operation) {
            case ADD:
                line.setAmount(line.getAmount().add(amount));
                History addHistory = History.createAdditionRecord(
                        employee, type, amount, currency, request != null ? request.getProject() : null
                );
                budget.addHistoryRecord(addHistory);
                break;

            case DEDUCT:
                // STRICT VALIDATION HERE
                budget.deductFunds(currency, amount); // Uses your existing method
                History deductHistory = History.createDeductionRecord(
                        request, type, amount, currency
                );
                deductHistory.setBudget(budget);
                budget.addHistoryRecord(deductHistory);
                historyRepoPort.save(deductHistory);
                break;
            default:
                throw new UnsupportedOperationException("Unknown operation: " + operation);
        }

        return budgetRepoPort.save(budget);
    }

    @Override
    public List<History> getHistory() {
        return historyRepoPort.findAll();
    }

    @Override
    public List<History> getHistoryByType(BudgetType type) {
        return historyRepoPort.findByBudgetType(type);
    }

    @Override
    public BigDecimal getBalance(BudgetType type, Currency currency) {
        return budgetRepoPort.findByType(type)
                .flatMap(budget -> budget.getLines().stream()
                        .filter(line -> line.getCurrency() == currency)
                        .findFirst()
                        .map(BudgetLine::getAmount))
                .orElse(BigDecimal.ZERO);
    }

}
