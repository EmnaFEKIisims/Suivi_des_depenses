package com.example.infrastructure.persistence.budget;

import com.example.core.budget.Budget;
import com.example.core.budget.BudgetRepoPort;
import com.example.core.budget.BudgetType;
import com.example.core.budget.HistoryRepoPort;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class BudgetJpaAdapter implements BudgetRepoPort {

    private final BudgetRepo budgetRepo;

    public BudgetJpaAdapter(BudgetRepo budgetRepo) {
        this.budgetRepo = budgetRepo;
    }

    @Override
    public Optional<Budget> findByType(BudgetType type) {
        return budgetRepo.findByType(type);
    }

    @Override
    public Budget save(Budget budget) {
        return budgetRepo.save(budget);
    }
}
