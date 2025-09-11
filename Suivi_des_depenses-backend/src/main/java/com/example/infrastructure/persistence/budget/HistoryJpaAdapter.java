package com.example.infrastructure.persistence.budget;

import com.example.core.budget.BudgetType;
import com.example.core.budget.History;
import com.example.core.budget.HistoryRepoPort;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class HistoryJpaAdapter implements HistoryRepoPort {

    private final HistoryRepo historyRepo;

    public HistoryJpaAdapter(HistoryRepo historyRepo) {
        this.historyRepo = historyRepo;
    }

    @Override
    public History save(History history) {
        return historyRepo.save(history);
    }

    @Override
    public List<History> findAll() {
        return historyRepo.findAllByOrderByOperationDateDescOperationTimeDesc();
    }


    @Override
    public List<History> findByBudgetType(BudgetType type) {
        return historyRepo.findByBudgetTypeOrderByOperationDateDescOperationTimeDesc(type);
    }

}
