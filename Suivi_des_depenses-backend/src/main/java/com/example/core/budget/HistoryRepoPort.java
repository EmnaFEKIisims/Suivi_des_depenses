package com.example.core.budget;

import java.util.List;

public interface HistoryRepoPort {

    History save(History history);
    List<History> findAll();
    List<History> findByBudgetType(BudgetType type);
}
