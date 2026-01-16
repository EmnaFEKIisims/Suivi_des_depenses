package com.example.infrastructure.web;

import com.example.core.employee.Employee;
import com.example.core.employee.EmployeeServices;
import com.example.core.exceptions.BusinessException;
import com.example.core.expenseRequest.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expense-requests")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ExpenseRequestController {

    private final ExpenseRequestServices expenseRequestServices;
    private final EmployeeServices employeeServices;

    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ExpenseRequest> createExpenseRequest(@RequestBody @Valid ExpenseRequest request) {
        ExpenseRequest created = expenseRequestServices.createExpenseRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or (authentication.principal.username == @expenseRequestServices.getExpenseRequestById(#id)?.employee?.email)")
    public ResponseEntity<ExpenseRequest> updateExpenseRequest(@PathVariable Long id, @RequestBody @Valid ExpenseRequest request) {
        checkRequestIsSubmitted(id);
        ExpenseRequest updated = expenseRequestServices.updateExpenseRequest(id, request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/details/add/{requestId}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or (authentication.principal.username == @expenseRequestServices.getExpenseRequestById(#requestId)?.employee?.email)")
    public ResponseEntity<ExpenseDetails> addExpenseDetail(@PathVariable Long requestId, @RequestBody @Valid ExpenseDetails detail) {
        checkRequestIsSubmitted(requestId);
        ExpenseDetails created = expenseRequestServices.addExpenseDetail(requestId, detail);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/details/update/{detailId}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or (authentication.principal.username == @expenseRequestServices.getDetailOwnerEmail(#detailId))")
    public ResponseEntity<ExpenseDetails> updateExpenseDetail(@PathVariable Long detailId, @RequestBody @Valid ExpenseDetails detail) {
        Long requestId = expenseRequestServices.getRequestIdFromDetail(detailId);
        checkRequestIsSubmitted(requestId);
        ExpenseDetails updated = expenseRequestServices.updateExpenseDetail(detailId, detail);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/details/remove/{detailId}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or (authentication.principal.username == @expenseRequestServices.getDetailOwnerEmail(#detailId))")
    public ResponseEntity<Void> removeExpenseDetail(@PathVariable Long detailId) {
        Long requestId = expenseRequestServices.getRequestIdFromDetail(detailId);
        checkRequestIsSubmitted(requestId);
        expenseRequestServices.removeExpenseDetail(detailId);
        return ResponseEntity.noContent().build();
    }

    // DTO pour approve (exactement comme ton front envoie)
    public record ApprovalRequest(String comment, Map<String, Double> approvedAmounts) {}

    @PostMapping("/{requestId}/approve")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ExpenseRequest> approveRequest(
            @PathVariable Long requestId,
            @RequestBody(required = false) ApprovalRequest body) {

        checkRequestIsSubmitted(requestId);

        String comment = (body != null && body.comment() != null && !body.comment().trim().isEmpty())
                ? body.comment().trim()
                : null;

        Map<String, Double> approvedAmountsMap = (body != null && body.approvedAmounts() != null)
                ? body.approvedAmounts()
                : null;

        // Appel corrigé : on passe le map au service
        expenseRequestServices.saveApproval(requestId, comment, true, approvedAmountsMap);

        ExpenseRequest approved = expenseRequestServices.approveRequest(requestId);
        return ResponseEntity.ok(approved);
    }

    public record RejectionRequest(@NotBlank(message = "Rejection reason is required") String reason) {}

    @PostMapping("/{requestId}/reject")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ExpenseRequest> rejectRequest(@PathVariable Long requestId, @RequestBody @Valid RejectionRequest body) {
        checkRequestIsSubmitted(requestId);
        expenseRequestServices.saveApproval(requestId, body.reason(), false, null); // pas de map pour reject
        ExpenseRequest rejected = expenseRequestServices.rejectRequest(requestId, body.reason());
        return ResponseEntity.ok(rejected);
    }

    private void checkRequestIsSubmitted(Long requestId) {
        ExpenseRequest request = expenseRequestServices.getExpenseRequestById(requestId);
        if (request.getStatus() != ExpenseStatus.SUBMITTED) {
            throw new BusinessException("This operation is only allowed on SUBMITTED requests");
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or (authentication.principal.username == @expenseRequestServices.getExpenseRequestById(#id)?.employee?.email)")
    public ResponseEntity<ExpenseRequest> getById(@PathVariable Long id) {
        return ResponseEntity.ok(expenseRequestServices.getExpenseRequestById(id));
    }

    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<ExpenseRequest>> getAll() {
        return ResponseEntity.ok(expenseRequestServices.getAllExpenseRequests());
    }

    @GetMapping("/my-requests")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ExpenseRequest>> getMyRequests(Authentication auth) {
        Employee emp = employeeServices.findByEmail(auth.getName())
                .orElseThrow(() -> new BusinessException("Employee not found"));
        return ResponseEntity.ok(expenseRequestServices.getRequestsByEmployee(emp.getCIN()));
    }

    @GetMapping("/details/{requestId}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or (authentication.principal.username == @expenseRequestServices.getExpenseRequestById(#requestId)?.employee?.email)")
    public ResponseEntity<List<ExpenseDetails>> getDetails(@PathVariable Long requestId) {
        return ResponseEntity.ok(expenseRequestServices.getDetailsByRequestId(requestId));
    }

    @GetMapping("/{requestId}/totals")
    public ResponseEntity<Map<Currency, Double>> getTotals(@PathVariable Long requestId) {
        return ResponseEntity.ok(expenseRequestServices.calculateTotalAmountsByCurrency(requestId));
    }

    @GetMapping("/by-employee/{employeeCin}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or (authentication.principal.username == @employeeServices.findByCIN(#employeeCin)?.email)")
    public ResponseEntity<List<ExpenseRequest>> getRequestsByEmployee(@PathVariable String employeeCin) {
        return ResponseEntity.ok(expenseRequestServices.getRequestsByEmployee(employeeCin));
    }

    @GetMapping("/by-project/{projectId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<ExpenseRequest>> getRequestsByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(expenseRequestServices.getRequestsByProject(projectId));
    }

    @GetMapping("/by-status/{status}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<List<ExpenseRequest>> getRequestsByStatus(@PathVariable ExpenseStatus status) {
        return ResponseEntity.ok(expenseRequestServices.getRequestsByStatus(status));
    }

    @GetMapping("/by-currency/{currency}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<ExpenseRequest>> getRequestsByCurrency(@PathVariable Currency currency) {
        return ResponseEntity.ok(expenseRequestServices.getRequestsByCurrency(currency));
    }

    @GetMapping("/generate-reference")
    public ResponseEntity<String> generateReference() {
        return ResponseEntity.ok(expenseRequestServices.generateReference());
    }
}