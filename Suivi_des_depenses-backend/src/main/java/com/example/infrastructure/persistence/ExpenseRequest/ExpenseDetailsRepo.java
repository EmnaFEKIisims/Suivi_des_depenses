package com.example.infrastructure.persistence.ExpenseRequest;

import com.example.core.expenseRequest.ExpenseDetails;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseDetailsRepo extends JpaRepository<ExpenseDetails, Long> {
    List<ExpenseDetails> findByExpenseRequestIdRequest(Long requestId);

    List<ExpenseDetails> findByExpenseRequestIdRequestAndCurrency(Long requestId, String currency);

}