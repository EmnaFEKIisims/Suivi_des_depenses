package com.example.infrastructure.persistence.budget;

import com.example.core.budget.BudgetType;
import com.example.core.budget.History;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface HistoryRepo extends JpaRepository<History, Long> {

    @Query("SELECT h FROM History h ORDER BY h.operationDate DESC, h.operationTime DESC")
    List<History> findAllByOrderByOperationDateDescOperationTimeDesc();
    List<History> findByBudgetTypeOrderByOperationDateDescOperationTimeDesc(BudgetType type);

}
