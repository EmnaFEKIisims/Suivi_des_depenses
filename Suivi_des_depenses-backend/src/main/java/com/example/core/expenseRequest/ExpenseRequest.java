package com.example.core.expenseRequest;

import com.example.core.employee.Employee;
import com.example.core.project.Project;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;



@Entity
@Table(name = "expense_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(value = {"expenseRequest"}, allowSetters = true)
@ToString(exclude = {"employee", "project", "details"})
public class ExpenseRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idRequest", nullable = false, unique = true)
    private Long idRequest;

    @Column(name = "reference", nullable = false, unique = true)
    private String reference;

    @ManyToOne
    @JoinColumn(name = "employee_cin", referencedColumnName = "CIN", nullable = false)
    private Employee employee;

    @ManyToOne
    @JoinColumn(name = "project_id", referencedColumnName = "idProject", nullable = false)
    private Project project;

    @Column(name = "startDate", nullable = false)
    private LocalDate startDate;

    @Column(name = "returnDate", nullable = false)
    private LocalDate returnDate;


    @Column(name = "mission", nullable = false)
    private String mission;

    @Column(name = "missionLocation", nullable = false)
    private String missionLocation;

    @Column(name = "reimbursementMethod", nullable = false)
    private String reimbursementMethod;


    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ExpenseStatus status = ExpenseStatus.SUBMITTED;

    @OneToMany(mappedBy = "expenseRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ExpenseDetails> details;


    @Transient
    @JsonIgnore
    private Map<Currency, Double> amountByCurrency;


    @JsonProperty("totalAmounts")
    public String getFormattedTotals() {
        if (amountByCurrency == null) {
            calculateTotals();
        }
        return amountByCurrency.entrySet().stream()
                .map(e -> e.getKey().name() + " " + e.getValue())
                .collect(Collectors.joining(", "));
    }

    public void calculateTotals() {
        this.amountByCurrency = new HashMap<>();
        if (this.details != null) {
            for (ExpenseDetails detail : this.details) {
                Currency currency = detail.getCurrency();
                Double amount = detail.getAmount();
                amountByCurrency.merge(currency, amount, Double::sum);
            }
        }
    }


}
