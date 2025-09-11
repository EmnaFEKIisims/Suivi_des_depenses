package com.example.core.budget;

import java.util.Optional;

public interface BudgetRepoPort {

    Optional<Budget> findByType(BudgetType type);
    Budget save(Budget budget);
}
