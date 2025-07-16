package com.example.infrastructure.persistence;

import com.example.core.expenseRequest.ExpenseDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExpenseDetailsRepo extends JpaRepository<ExpenseDetails, Long> {
    List<ExpenseDetails> findByExpenseRequestIdRequest(Long requestId);

    List<ExpenseDetails> findByExpenseRequestIdRequestAndCurrency(Long requestId, String currency);

}