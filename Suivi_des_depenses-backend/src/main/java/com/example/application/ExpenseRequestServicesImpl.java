package com.example.application;
import com.example.core.budget.BudgetServices;
import com.example.core.budget.BudgetType;
import com.example.core.budget.Operation;
import com.example.core.employee.Employee;
import com.example.core.employee.EmployeeServices;
import com.example.core.exceptions.BusinessException;
import com.example.core.exceptions.InsufficientFundsException;
import com.example.core.expenseRequest.ExpenseRequest;
import com.example.core.expenseRequest.ExpenseRequestRepoPort;
import com.example.core.expenseRequest.ExpenseRequestServices;
import com.example.core.project.Project;
import com.example.core.project.ProjectServices;
import com.example.infrastructure.persistence.ExpenseRequest.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.core.expenseRequest.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Transactional
public class ExpenseRequestServicesImpl implements ExpenseRequestServices {

    private final ExpenseRequestRepoPort requestRepoPort;
    private final EmployeeServices employeeServices;
    private final ProjectServices projectServices;
    private  final BudgetServices budgetServices;

    @Override
    public ExpenseRequest createExpenseRequest(ExpenseRequest expenseRequest) {
        String employeeRef = expenseRequest.getEmployee().getReference();
        Employee employee = employeeServices.getEmployeeByReference(employeeRef)
                .orElseThrow(() -> new BusinessException("Employee not found"));

        Long projectId = expenseRequest.getProject().getIdProject();
        Project project = projectServices.getProjectById(projectId)
                .orElseThrow(() -> new BusinessException("Project not found"));

        String reference = requestRepoPort.generateReference();

        ExpenseRequest newRequest = new ExpenseRequest();
        newRequest.setReference(reference);
        newRequest.setEmployee(employee);
        newRequest.setProject(project);
        newRequest.setStartDate(expenseRequest.getStartDate());
        newRequest.setReturnDate(expenseRequest.getReturnDate());
        newRequest.setMission(expenseRequest.getMission());
        newRequest.setMissionLocation(expenseRequest.getMissionLocation());
        newRequest.setReimbursementMethod(expenseRequest.getReimbursementMethod());
        newRequest.setStatus(ExpenseStatus.SUBMITTED);

        List<ExpenseDetails> details = expenseRequest.getDetails();
        if (details != null) {
            details.forEach(d -> d.setExpenseRequest(newRequest));
            newRequest.setDetails(details);
        } else {
            newRequest.setDetails(new ArrayList<>());
        }

        ExpenseRequest savedRequest = requestRepoPort.saveRequest(newRequest);

        // Validate currency limit
        validateCurrencyLimit(savedRequest.getIdRequest(), 2);

        savedRequest.calculateTotals();
        return savedRequest;
    }

    @Override
    public ExpenseRequest updateExpenseRequest(Long id, ExpenseRequest updatedRequest) {
        ExpenseRequest existingRequest = requestRepoPort.findRequestById(id)
                .orElseThrow(() -> new BusinessException("Expense request not found"));

        existingRequest.setStartDate(updatedRequest.getStartDate());
        existingRequest.setReturnDate(updatedRequest.getReturnDate());
        existingRequest.setMission(updatedRequest.getMission());
        existingRequest.setMissionLocation(updatedRequest.getMissionLocation());
        existingRequest.setReimbursementMethod(updatedRequest.getReimbursementMethod());
        existingRequest.setStatus(updatedRequest.getStatus());

        if (updatedRequest.getDetails() != null) {
            existingRequest.getDetails().clear();
            updatedRequest.getDetails().forEach(d -> {
                d.setExpenseRequest(existingRequest);
                existingRequest.getDetails().add(d);
            });
        }

        ExpenseRequest savedRequest = requestRepoPort.saveRequest(existingRequest);

        // Validate again after update
        validateCurrencyLimit(savedRequest.getIdRequest(), 2);

        savedRequest.calculateTotals();
        return savedRequest;
    }

    @Override
    public ExpenseRequest getExpenseRequestById(Long id) {
        return requestRepoPort.findRequestById(id)
                .orElseThrow(() -> new BusinessException("Expense request not found"));
    }

    @Override
    public List<ExpenseRequest> getAllExpenseRequests() {
        return requestRepoPort.findAllRequests();
    }

    @Override
    public ExpenseDetails addExpenseDetail(Long requestId, ExpenseDetails detail) {
        ExpenseRequest request = getExpenseRequestById(requestId);
        detail.setExpenseRequest(request);
        return requestRepoPort.saveDetail(detail);
    }

    @Override
    public void removeExpenseDetail(Long detailId) {
        requestRepoPort.deleteDetailById(detailId);
    }



    @Override
    public List<ExpenseDetails> getDetailsByRequestId(Long requestId) {
        return requestRepoPort.findDetailsByRequestId(requestId);
    }

    @Override
    public Map<Currency, Double> calculateTotalAmountsByCurrency(Long requestId) {
        return requestRepoPort.sumAmountsByCurrencyForRequest(requestId);
    }

    @Override
    public void validateCurrencyLimit(Long requestId, int maxCurrencies) {
        Map<Currency, Double> totals = requestRepoPort.sumAmountsByCurrencyForRequest(requestId);
        if (totals.size() > maxCurrencies) {
            throw new BusinessException("Max " + maxCurrencies + " currencies allowed");
        }
    }

    @Override
    public ExpenseDetails updateExpenseDetail(Long detailId, ExpenseDetails updatedDetail) {
        ExpenseDetails existingDetail = requestRepoPort.findDetailById(detailId)
                .orElseThrow(() -> new BusinessException("Expense detail not found"));

        existingDetail.setAmount(updatedDetail.getAmount());
        existingDetail.setCurrency(updatedDetail.getCurrency());
        existingDetail.setDescription(updatedDetail.getDescription());
        existingDetail.setCurrencyDescription(updatedDetail.getCurrencyDescription());

        return requestRepoPort.saveDetail(existingDetail);
    }




    @Override
    public ExpenseRequest approveRequest(Long requestId) {
        ExpenseRequest request = requestRepoPort.findRequestById(requestId)
                .orElseThrow(() -> new BusinessException("Expense request not found"));

        if (!request.getStatus().equals(ExpenseStatus.SUBMITTED)) {
            throw new BusinessException("Request must be in SUBMITTED status");
        }

        request.calculateTotals();
        deductFromBudget(request);

        request.setStatus(ExpenseStatus.APPROVED);
        return requestRepoPort.saveRequest(request);
    }

    private void deductFromBudget(ExpenseRequest request) {
        BudgetType budgetType = "Cash Desk".equalsIgnoreCase(request.getReimbursementMethod())
                ? BudgetType.CASH
                : BudgetType.BANK;

        request.getAmountByCurrency().forEach((currency, amount) -> {
            try {
                budgetServices.modifyBudget(
                        Operation.DEDUCT,
                        budgetType,
                        BigDecimal.valueOf(amount),
                        currency,
                        request.getEmployee(),
                        request
                );
            } catch (InsufficientFundsException e) {
                throw new BusinessException(
                        String.format("Cannot deduct %s %s: %s",
                                amount, currency, e.getMessage())
                );
            }
        });
    }

    @Override
    public ExpenseRequest rejectRequest(Long requestId, String rejectionReason) {
        ExpenseRequest request = getExpenseRequestById(requestId);
        request.setStatus(ExpenseStatus.REJECTED);
        return requestRepoPort.saveRequest(request);
    }

    @Override
    public List<ExpenseRequest> getRequestsByEmployee(String employeeCin) {
        return requestRepoPort.findByEmployeeId(employeeCin);
    }

    @Override
    public List<ExpenseRequest> getRequestsByProject(Long projectId) {
        return requestRepoPort.findByProjectId(projectId);
    }

    @Override
    public List<ExpenseRequest> getRequestsByStatus(ExpenseStatus status) {
        return requestRepoPort.findByStatus(status);
    }

    @Override
    public List<ExpenseRequest> getRequestsByCurrency(Currency currency) {
        return requestRepoPort.findRequestsByCurrency(currency);
    }

    @Override
    public String generateReference() {
        return requestRepoPort.generateReference();
    }
}
