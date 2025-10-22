package com.example.infrastructure.web;


import com.example.core.budget.*;
import com.example.core.employee.Employee;
import com.example.core.employee.EmployeeServices;
import com.example.core.exceptions.BudgetNotFoundException;
import com.example.core.exceptions.BusinessException;
import com.example.core.exceptions.InsufficientFundsException;
import com.example.core.expenseRequest.Currency;
import com.example.core.expenseRequest.ExpenseRequest;
import com.example.core.expenseRequest.ExpenseRequestServices;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@Transactional
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetServices budgetServices;
    private final ExpenseRequestServices expenseRequestServices;
    private final EmployeeServices employeeService;

    public BudgetController(BudgetServices budgetServices , ExpenseRequestServices expenseRequestServices
                                , EmployeeServices employeeServices) {
        this.budgetServices = budgetServices;
        this.expenseRequestServices = expenseRequestServices;
        this.employeeService = employeeServices;
    }

    @GetMapping("/cash")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Budget> getCashBudget() {
        return ResponseEntity.ok(budgetServices.getCashBudget());
    }

    @GetMapping("/bank")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Budget> getBankBudget() {
        return ResponseEntity.ok(budgetServices.getBankBudget());
    }

    @PostMapping("/{type}/operations")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Budget> modifyBudget(
            @PathVariable BudgetType type,
            @RequestParam BigDecimal amount,
            @RequestParam Currency currency,
            @RequestHeader("X-Employee-Reference") String employeeReference) {

        // ONLY ALLOW ADD OPERATIONS VIA THIS ENDPOINT
        Employee employee = employeeService.getEmployeeByReference(employeeReference)
                .orElseThrow(() -> new BusinessException("Employee not found"));

        return ResponseEntity.ok(
                budgetServices.modifyBudget(
                        Operation.ADD, // FORCE ADD OPERATION
                        type,
                        amount,
                        currency,
                        employee,
                        null // No expense request for additions
                )
        );
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<History>> getHistory() {
        return ResponseEntity.ok(budgetServices.getHistory());
    }

    @GetMapping("/history/{type}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<History>> getHistoryByType(
            @PathVariable BudgetType type) {
        return ResponseEntity.ok(budgetServices.getHistoryByType(type));
    }

    @GetMapping("/balance")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<BigDecimal> getBalance(
            @RequestParam BudgetType type,
            @RequestParam Currency currency) {
        return ResponseEntity.ok(budgetServices.getBalance(type, currency));
    }

    @ExceptionHandler(BudgetNotFoundException.class)
    public ResponseEntity<String> handleBudgetNotFound(BudgetNotFoundException ex) {
        return ResponseEntity.status(404).body(ex.getMessage());
    }

    @ExceptionHandler(InsufficientFundsException.class)
    public ResponseEntity<String> handleInsufficientFunds(InsufficientFundsException ex) {
        return ResponseEntity.status(400).body(ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequests(IllegalArgumentException ex) {
        return ResponseEntity.status(400).body(ex.getMessage());
    }

}
