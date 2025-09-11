package com.example.infrastructure.persistence.budget;

import com.example.core.budget.Budget;
import com.example.core.budget.BudgetType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BudgetRepo extends JpaRepository<Budget, Long> {

    Optional<Budget> findByType(BudgetType type);

}
