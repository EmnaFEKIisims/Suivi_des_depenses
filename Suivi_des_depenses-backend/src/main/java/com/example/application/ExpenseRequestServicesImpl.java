package com.example.application;

import com.example.core.budget.BudgetServices;
import com.example.core.budget.BudgetType;
import com.example.core.budget.Operation;
import com.example.core.employee.Employee;
import com.example.core.employee.EmployeeServices;
import com.example.core.exceptions.BusinessException;
import com.example.core.exceptions.InsufficientFundsException;
import com.example.core.expenseRequest.*;
import com.example.core.project.Project;
import com.example.core.project.ProjectServices;
import com.fasterxml.jackson.core.type.TypeReference;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
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
    private final BudgetServices budgetServices;

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
        Map<Currency, Double> totals =
                requestRepoPort.sumAmountsByCurrencyForRequest(requestId);

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
    public void saveApproval(Long requestId, String comment, boolean isApproval, Map<String, Double> approvedAmountsMap) {
        ExpenseRequest request = requestRepoPort.findRequestById(requestId)
                .orElseThrow(() -> new BusinessException("Request not found"));

        ObjectMapper mapper = new ObjectMapper();

        if (request.getRequestedAmounts() == null || request.getRequestedAmounts().isEmpty()) {
            request.calculateTotals();
            Map<String, Double> totalsAsStringKey = request.getAmountByCurrency().entrySet().stream()
                    .collect(Collectors.toMap(
                            e -> e.getKey().name(),
                            Map.Entry::getValue
                    ));
            request.setRequestedAmounts(totalsAsStringKey);
        }


// Sauvegarde des montants approuvés
        if (isApproval && approvedAmountsMap != null && !approvedAmountsMap.isEmpty()) {
            request.setApprovedAmounts(approvedAmountsMap);
        }

        // 3. Infos admin
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        request.setApprovedBy(adminEmail);
        request.setApprovedAt(LocalDateTime.now());

        // 4. Commentaire ou raison
        if (isApproval) {
            request.setApprovalComment(comment != null && !comment.isBlank() ? comment : "Approved");
        } else {
            request.setRejectionReason(comment != null && !comment.isBlank() ? comment : "No reason provided");
        }

        requestRepoPort.saveRequest(request);
    }

    @Override
    public ExpenseRequest approveRequest(Long requestId) {
        ExpenseRequest request = requestRepoPort.findRequestById(requestId)
                .orElseThrow(() -> new BusinessException("Request not found"));

        if (!request.getStatus().equals(ExpenseStatus.SUBMITTED)) {
            throw new BusinessException("Only SUBMITTED requests can be approved");
        }

        // Use approvedAmounts directly (no JSON parsing)
        Map<String, Double> amountsToDeduct = request.getApprovedAmounts();

        // Deduction + history
        deductFromBudget(request, amountsToDeduct);

        request.setStatus(ExpenseStatus.APPROVED);
        return requestRepoPort.saveRequest(request);
    }


    private void deductFromBudget(ExpenseRequest request, Map<String, Double> amountsMap) {
        // Déterminer le type de budget depuis l'enum directement
        BudgetType budgetType = request.getReimbursementMethod() != null
                ? request.getReimbursementMethod()
                : BudgetType.BANK; // fallback si null

        amountsMap.forEach((currencyCode, amount) -> {
            if (amount != null && amount > 0) {
                Currency currency;
                try {
                    currency = Currency.valueOf(currencyCode.toUpperCase());
                } catch (IllegalArgumentException e) {
                    throw new BusinessException("Currency not supported: " + currencyCode);
                }

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
                            "Insufficient funds in " + budgetType + " for " + currency
                    );
                }
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

        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        boolean isAdmin = SecurityContextHolder.getContext()
                .getAuthentication().getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        List<ExpenseRequest> requests = requestRepoPort.findByStatus(status);

        if (!isAdmin) {
            return requests.stream()
                    .filter(r -> r.getEmployee().getEmail().equals(email))
                    .collect(Collectors.toList());
        }

        return requests;
    }

    @Override
    public List<ExpenseRequest> getRequestsByCurrency(Currency currency) {
        return requestRepoPort.findRequestsByCurrency(currency);
    }

    @Override
    public String generateReference() {
        return requestRepoPort.generateReference();
    }

    @Override
    public Long getRequestIdFromDetail(Long detailId) {
        ExpenseDetails detail = requestRepoPort.findDetailById(detailId)
                .orElseThrow(() -> new BusinessException("Detail not found with id: " + detailId));
        return detail.getExpenseRequest().getIdRequest();
    }

}
