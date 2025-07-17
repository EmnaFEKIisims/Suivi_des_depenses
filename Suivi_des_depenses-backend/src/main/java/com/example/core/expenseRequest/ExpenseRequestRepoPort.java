package com.example.core.expenseRequest;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface ExpenseRequestRepoPort {

    ExpenseRequest saveRequest(ExpenseRequest request);
    Optional<ExpenseRequest> findRequestById(Long id);
    List<ExpenseRequest> findAllRequests();

    ExpenseDetails saveDetail(ExpenseDetails detail);
    Optional<ExpenseDetails> findDetailById(Long id);
    List<ExpenseDetails> findDetailsByRequestId(Long requestId);
    void deleteDetailById(Long id);

    List<ExpenseRequest> findByStatus(ExpenseStatus status);
    List<ExpenseRequest> findByEmployeeId(String employeeCin);
    List<ExpenseRequest> findByProjectId(Long projectId);

    void updateRequestStatus(Long requestId, ExpenseStatus newStatus);
    void updateDetailAmount(Long detailId, Double newAmount);

    Map<Currency, Double> sumAmountsByCurrencyForRequest(Long requestId);
    Double sumAllAmountsByEmployeeAndStatus(String employeeCin, ExpenseStatus status);
    List<ExpenseDetails> findDetailsByRequestIdAndCurrency(Long requestId, String currency);
    List<ExpenseRequest> findRequestsByCurrency(Currency currency);
    Optional<ExpenseRequest> findTopByOrderByReferenceDesc();
     String generateReference();

}
