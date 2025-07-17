package com.example.infrastructure.web;


import com.example.core.expenseRequest.ExpenseRequest;
import com.example.core.expenseRequest.ExpenseStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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


    @PostMapping("/createExpenseRequest")
    public ResponseEntity<ExpenseRequest> createExpenseRequest(@RequestBody @Valid ExpenseRequest request) {
        System.out.println("ExpenseRequest reçu: " + request);
        ExpenseRequest created = expenseRequestServices.createExpenseRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }


    @PutMapping("/updateExpenseRequest/{id}")
    public ResponseEntity<ExpenseRequest> updateExpenseRequest(
            @PathVariable Long id,
            @RequestBody @Valid ExpenseRequest request) {
        ExpenseRequest updated = expenseRequestServices.updateExpenseRequest(id, request);
        return ResponseEntity.ok(updated);
    }


    @GetMapping("/getExpenseRequestById/{id}")
    public ResponseEntity<ExpenseRequest> getExpenseRequestById(@PathVariable Long id) {
        ExpenseRequest request = expenseRequestServices.getExpenseRequestById(id);
        return ResponseEntity.ok(request);
    }

    @GetMapping
    public ResponseEntity<List<ExpenseRequest>> getAllExpenseRequests() {
        List<ExpenseRequest> requests = expenseRequestServices.getAllExpenseRequests();
        return ResponseEntity.ok(requests);
    }

    // ============= ExpenseDetails Endpoints =============
    @PostMapping("/details/addExpenseDetail/{requestId}")
    public ResponseEntity<ExpenseDetails> addExpenseDetail(
            @PathVariable Long requestId,
            @RequestBody @Valid ExpenseDetails detail) {
        ExpenseDetails created = expenseRequestServices.addExpenseDetail(requestId, detail);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/details/removeExpenseDetail/{detailId}")
    public ResponseEntity<Void> removeExpenseDetail(@PathVariable Long detailId) {
        expenseRequestServices.removeExpenseDetail(detailId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/details/updateExpenseDetail/{detailId}")
    public ResponseEntity<ExpenseDetails> updateExpenseDetail(
            @PathVariable Long detailId,
            @RequestBody @Valid ExpenseDetails detail) {
        ExpenseDetails updated = expenseRequestServices.updateExpenseDetail(detailId, detail);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/details/getDetailsByRequestId/{requestId}")
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

    @PostMapping("/{requestId}/submit")
    public ResponseEntity<ExpenseRequest> submitForApproval(@PathVariable Long requestId) {
        ExpenseRequest submitted = expenseRequestServices.submitForApproval(requestId);
        return ResponseEntity.ok(submitted);
    }

    @PostMapping("/{requestId}/approve")
    public ResponseEntity<ExpenseRequest> approveRequest(
            @PathVariable Long requestId,
            @RequestParam(required = false) String approverComments) {
        ExpenseRequest approved = expenseRequestServices.approveRequest(requestId, approverComments);
        return ResponseEntity.ok(approved);
    }

    @PostMapping("/{requestId}/reject")
    public ResponseEntity<ExpenseRequest> rejectRequest(
            @PathVariable Long requestId,
            @RequestParam String rejectionReason) {
        ExpenseRequest rejected = expenseRequestServices.rejectRequest(requestId, rejectionReason);
        return ResponseEntity.ok(rejected);
    }

    
    @GetMapping("/by-employee/{employeeCin}")
    public ResponseEntity<List<ExpenseRequest>> getRequestsByEmployee(
            @PathVariable String employeeCin) {
        List<ExpenseRequest> requests = expenseRequestServices.getRequestsByEmployee(employeeCin);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/by-project/{projectId}")
    public ResponseEntity<List<ExpenseRequest>> getRequestsByProject(
            @PathVariable Long projectId) {
        List<ExpenseRequest> requests = expenseRequestServices.getRequestsByProject(projectId);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/by-status/{status}")
    public ResponseEntity<List<ExpenseRequest>> getRequestsByStatus(
            @PathVariable ExpenseStatus status) {
        List<ExpenseRequest> requests = expenseRequestServices.getRequestsByStatus(status);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/by-currency/{currency}")
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
