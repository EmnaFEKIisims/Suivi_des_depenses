package com.example.core.expenseRequest;

import com.example.core.exceptions.BusinessException;

import java.util.List;
import java.util.Map;

public interface ExpenseRequestServices {

    ExpenseRequest createExpenseRequest(ExpenseRequest expenseRequest);
    ExpenseRequest updateExpenseRequest(Long id, ExpenseRequest updatedRequest);
    void deleteExpenseRequest(Long id);
    ExpenseRequest getExpenseRequestById(Long id);
    List<ExpenseRequest> getAllExpenseRequests();



    ExpenseDetails addExpenseDetail(Long requestId, ExpenseDetails detail);
    void removeExpenseDetail(Long detailId);
    ExpenseDetails updateExpenseDetail(Long detailId, ExpenseDetails updatedDetail);
    List<ExpenseDetails> getDetailsByRequestId(Long requestId);

    Map<String, Double> calculateTotalAmountsByCurrency(Long requestId);
    void validateCurrencyLimit(Long requestId, int maxCurrencies) throws BusinessException;
    ExpenseRequest submitForApproval(Long requestId);
    ExpenseRequest approveRequest(Long requestId, String approverComments);
    ExpenseRequest rejectRequest(Long requestId, String rejectionReason);



    List<ExpenseRequest> getRequestsByEmployee(String employeeCin);
    List<ExpenseRequest> getRequestsByProject(Long projectId);
    List<ExpenseRequest> getRequestsByStatus(ExpenseStatus status);

}
