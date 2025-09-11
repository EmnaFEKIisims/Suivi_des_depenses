package com.example.core.budget;


import com.example.core.employee.Employee;
import com.example.core.expenseRequest.Currency;
import com.example.core.expenseRequest.ExpenseRequest;
import com.example.core.project.Project;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class History {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, unique = true)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "operation", nullable = false, length = 15)
    private Operation operation;  // ADD or DEDUCT

    @Enumerated(EnumType.STRING)
    @Column(name = "budget_type", nullable = false, length = 10)
    private BudgetType budgetType;  // CASH or BANK

    @ManyToOne
    @JoinColumn(name = "employee_reference", referencedColumnName = "reference", nullable = false)
    private Employee employee;

    @Column(name = "amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "currency", nullable = false, length = 3)
    private Currency currency;

    @Column(name = "operation_date", nullable = false)
    private LocalDate operationDate;

    @Column(name = "operation_time", nullable = false)
    private LocalTime operationTime;


    @ManyToOne
    @JoinColumn(name = "expense_request_id")
    private ExpenseRequest expenseRequest;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;


    @ManyToOne
    @JoinColumn(name = "budget_id")
    @JsonBackReference
    private Budget budget;

    // Pre-persist method to set timestamps automatically
    @PrePersist
    protected void setOperationTimestamps() {
        if (this.operationDate == null) {
            this.operationDate = LocalDate.now();
        }
        if (this.operationTime == null) {
            this.operationTime = LocalTime.now();
        }
    }

    // Business method to create history records
    public static History createDeductionRecord(
            ExpenseRequest request,
            BudgetType budgetType,
            BigDecimal amount,
            Currency currency) {
        History history = new History();
        history.setOperation(Operation.DEDUCT);
        history.setBudgetType(budgetType);
        history.setEmployee(request.getEmployee());
        history.setAmount(amount);
        history.setCurrency(currency);
        history.setExpenseRequest(request);
        history.setProject(request.getProject());
        return history;
    }



    public static History createAdditionRecord(
            Employee employee,
            BudgetType budgetType,
            BigDecimal amount,
            Currency currency,
            Project project) {
        History history = new History();
        history.setOperation(Operation.ADD);
        history.setBudgetType(budgetType);
        history.setEmployee(employee);
        history.setAmount(amount);
        history.setCurrency(currency);
        history.setProject(project);
        return history;
    }



}
