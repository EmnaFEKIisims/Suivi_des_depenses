package com.example.infrastructure.web;


import com.example.core.employee.Employee;
import com.example.core.employee.EmployeeServices;
import com.example.core.exceptions.BusinessException;
import com.example.core.exceptions.InsufficientFundsException;
import com.example.core.expenseRequest.ExpenseRequest;
import com.example.core.expenseRequest.ExpenseStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.example.core.expenseRequest.*;
import java.util.Map;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/expense-requests")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ExpenseRequestCotroller {

    private final ExpenseRequestServices expenseRequestServices;
    private final EmployeeServices employeeServices;


    @PostMapping("/createExpenseRequest")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<ExpenseRequest> createExpenseRequest(@RequestBody @Valid ExpenseRequest request) {
        System.out.println("ExpenseRequest reçu: " + request);
        ExpenseRequest created = expenseRequestServices.createExpenseRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }


    @PutMapping("/updateExpenseRequest/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or (authentication.principal.username == @expenseRequestServices.getExpenseRequestById(#id)?.employee?.getEmail() ?: '')")

    public ResponseEntity<ExpenseRequest> updateExpenseRequest(
            @PathVariable Long id,
            @RequestBody @Valid ExpenseRequest request) {
        ExpenseRequest updated = expenseRequestServices.updateExpenseRequest(id, request);
        return ResponseEntity.ok(updated);
    }


    @GetMapping("/getExpenseRequestById/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or (authentication.principal.username == @expenseRequestServices.getExpenseRequestById(#id)?.employee?.getEmail() ?: '')")
    public ResponseEntity<ExpenseRequest> getExpenseRequestById(@PathVariable Long id) {
        ExpenseRequest request = expenseRequestServices.getExpenseRequestById(id);
        return ResponseEntity.ok(request);
    }

    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<ExpenseRequest>> getAllExpenseRequests() {
        List<ExpenseRequest> requests = expenseRequestServices.getAllExpenseRequests();
        return ResponseEntity.ok(requests);
    }

    // ============= ExpenseDetails Endpoints =============
    @PostMapping("/details/addExpenseDetail/{requestId}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or (authentication.principal.username == @expenseRequestServices.getExpenseRequestById(#requestId)?.employee?.getEmail() ?: '')")
    public ResponseEntity<ExpenseDetails> addExpenseDetail(
            @PathVariable Long requestId,
            @RequestBody @Valid ExpenseDetails detail) {
        ExpenseDetails created = expenseRequestServices.addExpenseDetail(requestId, detail);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/details/removeExpenseDetail/{detailId}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or (authentication.principal.username == @expenseRequestServices.getExpenseDetailById(#detailId)?.expenseRequest?.employee?.getEmail() ?: '')")
    public ResponseEntity<Void> removeExpenseDetail(@PathVariable Long detailId) {
        expenseRequestServices.removeExpenseDetail(detailId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/details/updateExpenseDetail/{detailId}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or (authentication.principal.username == @expenseRequestServices.getExpenseDetailById(#detailId)?.expenseRequest?.employee?.getEmail() ?: '')")
    public ResponseEntity<ExpenseDetails> updateExpenseDetail(
            @PathVariable Long detailId,
            @RequestBody @Valid ExpenseDetails detail) {
        ExpenseDetails updated = expenseRequestServices.updateExpenseDetail(detailId, detail);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/details/getDetailsByRequestId/{requestId}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or (authentication.principal.username == @expenseRequestServices.getExpenseRequestById(#requestId)?.employee?.getEmail() ?: '')")
    public ResponseEntity<List<ExpenseDetails>> getDetailsByRequestId(
            @PathVariable Long requestId) {
        List<ExpenseDetails> details = expenseRequestServices.getDetailsByRequestId(requestId);
        return ResponseEntity.ok(details);
    }

    // ============= Business Operations =============
    @GetMapping("/{requestId}/currency-totals")
    public ResponseEntity<Map<Currency, Double>> calculateCurrencyTotals(
            @PathVariable Long requestId) {
        Map<Currency, Double> totals = expenseRequestServices.calculateTotalAmountsByCurrency(requestId);
        return ResponseEntity.ok(totals);
    }



    @PostMapping("/{requestId}/approve")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> approveRequest(@PathVariable Long requestId) {
        try {
            return ResponseEntity.ok(expenseRequestServices.approveRequest(requestId));
        } catch (BusinessException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @PostMapping("/{requestId}/reject")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ExpenseRequest> rejectRequest(
            @PathVariable Long requestId,
            @RequestParam String rejectionReason) {
        ExpenseRequest rejected = expenseRequestServices.rejectRequest(requestId, rejectionReason);
        return ResponseEntity.ok(rejected);
    }

    
    @GetMapping("/by-employee/{employeeCin}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or (authentication.principal.username == @employeeServices.findByCIN(#employeeCin)?.getEmail() ?: '')")
    public ResponseEntity<List<ExpenseRequest>> getRequestsByEmployee(
            @PathVariable String employeeCin) {
        List<ExpenseRequest> requests = expenseRequestServices.getRequestsByEmployee(employeeCin);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/by-project/{projectId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<ExpenseRequest>> getRequestsByProject(
            @PathVariable Long projectId) {
        List<ExpenseRequest> requests = expenseRequestServices.getRequestsByProject(projectId);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/by-status/{status}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<List<ExpenseRequest>> getRequestsByStatus(
            @PathVariable ExpenseStatus status) {
        List<ExpenseRequest> requests = expenseRequestServices.getRequestsByStatus(status);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/by-currency/{currency}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<ExpenseRequest>> getRequestsByCurrency(@PathVariable Currency currency) {
        List<ExpenseRequest> requests = expenseRequestServices.getRequestsByCurrency(currency);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/generate-reference")
    public ResponseEntity<String> generateReference() {
        String reference = expenseRequestServices.generateReference();
        return ResponseEntity.ok(reference);
    }

}
