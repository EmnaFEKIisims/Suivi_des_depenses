package com.example.application;
import com.example.core.exceptions.BusinessException;
import com.example.core.expenseRequest.ExpenseRequest;
import com.example.core.expenseRequest.ExpenseRequestRepoPort;
import com.example.core.expenseRequest.ExpenseRequestServices;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.core.expenseRequest.*;
import java.util.List;
import java.util.Map;



@Service
@RequiredArgsConstructor
public class ExpenseRequestServicesImpl implements ExpenseRequestServices {

    private final ExpenseRequestRepoPort requestRepoPort;

    // ============= ExpenseRequest CRUD Operations =============
    @Override
    @Transactional
    public ExpenseRequest createExpenseRequest(ExpenseRequest expenseRequest) {
        return requestRepoPort.saveRequest(expenseRequest);
    }

    @Override
    @Transactional
    public ExpenseRequest updateExpenseRequest(Long id, ExpenseRequest updatedRequest) {
        ExpenseRequest existing = requestRepoPort.findRequestById(id)
                .orElseThrow(() -> new BusinessException("Expense request not found"));
        // Update fields as needed
        existing.setMission(updatedRequest.getMission());
        existing.setMissionLocation(updatedRequest.getMissionLocation());
        existing.setReimbursementMethod(updatedRequest.getReimbursementMethod());
        // Don't update relationships directly here
        return requestRepoPort.saveRequest(existing);
    }

    @Override
    @Transactional
    public void deleteExpenseRequest(Long id) {
        requestRepoPort.deleteRequestById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseRequest getExpenseRequestById(Long id) {
        return requestRepoPort.findRequestById(id)
                .orElseThrow(() -> new BusinessException("Expense request not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseRequest> getAllExpenseRequests() {
        return requestRepoPort.findAllRequests();
    }

    // ============= ExpenseDetails Operations =============
    @Override
    @Transactional
    public ExpenseDetails addExpenseDetail(Long requestId, ExpenseDetails detail) {
        ExpenseRequest request = getExpenseRequestById(requestId);
        detail.setExpenseRequest(request);
        return requestRepoPort.saveDetail(detail);
    }

    @Override
    @Transactional
    public void removeExpenseDetail(Long detailId) {
        requestRepoPort.deleteDetailById(detailId);
    }

    @Override
    @Transactional
    public ExpenseDetails updateExpenseDetail(Long detailId, ExpenseDetails updatedDetail) {
        ExpenseDetails existing = requestRepoPort.findDetailById(detailId)
                .orElseThrow(() -> new BusinessException("Expense detail not found"));
        existing.setDescription(updatedDetail.getDescription());
        existing.setAmount(updatedDetail.getAmount());
        existing.setCurrency(updatedDetail.getCurrency());
        return requestRepoPort.saveDetail(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseDetails> getDetailsByRequestId(Long requestId) {
        return requestRepoPort.findDetailsByRequestId(requestId);
    }

    // ============= Business Logic =============
    @Override
    @Transactional(readOnly = true)
    public Map<String, Double> calculateTotalAmountsByCurrency(Long requestId) {
        return requestRepoPort.sumAmountsByCurrencyForRequest(requestId);
    }

    @Override
    @Transactional(readOnly = true)
    public void validateCurrencyLimit(Long requestId, int maxCurrencies) throws BusinessException {
        Map<String, Double> amountsByCurrency = calculateTotalAmountsByCurrency(requestId);
        if (amountsByCurrency.size() > maxCurrencies) {
            throw new BusinessException("Maximum " + maxCurrencies + " currencies allowed per request");
        }
    }

    @Override
    @Transactional
    public ExpenseRequest submitForApproval(Long requestId) {
        ExpenseRequest request = getExpenseRequestById(requestId);
        if (request.getStatus() != ExpenseStatus.DRAFT) {
            throw new BusinessException("Only draft requests can be submitted");
        }
        request.setStatus(ExpenseStatus.SUBMITTED);
        return requestRepoPort.saveRequest(request);
    }

    @Override
    @Transactional
    public ExpenseRequest approveRequest(Long requestId, String approverComments) {
        ExpenseRequest request = getExpenseRequestById(requestId);
        if (request.getStatus() != ExpenseStatus.SUBMITTED) {
            throw new BusinessException("Only submitted requests can be approved");
        }
        request.setStatus(ExpenseStatus.APPROVED);
        // Store comments if you have a field for it
        return requestRepoPort.saveRequest(request);
    }

    @Override
    @Transactional
    public ExpenseRequest rejectRequest(Long requestId, String rejectionReason) {
        ExpenseRequest request = getExpenseRequestById(requestId);
        if (request.getStatus() != ExpenseStatus.SUBMITTED) {
            throw new BusinessException("Only submitted requests can be rejected");
        }
        request.setStatus(ExpenseStatus.REJECTED);
        // Store rejection reason if you have a field for it
        return requestRepoPort.saveRequest(request);
    }

    // ============= Reporting =============
    @Override
    @Transactional(readOnly = true)
    public List<ExpenseRequest> getRequestsByEmployee(String employeeCin) {
        return requestRepoPort.findByEmployeeId(employeeCin);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseRequest> getRequestsByProject(Long projectId) {
        return requestRepoPort.findByProjectId(projectId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseRequest> getRequestsByStatus(ExpenseStatus status) {
        return requestRepoPort.findByStatus(status);
    }




}
