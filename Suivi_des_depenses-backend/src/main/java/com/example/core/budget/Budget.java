package com.example.core.budget;


import com.example.core.exceptions.InsufficientFundsException;
import com.example.core.expenseRequest.Currency;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "budgets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, unique = true)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, updatable = false, length = 10)
    private BudgetType type;  // Immutable after creation (CASH or BANK)

    @OneToMany(
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @JoinColumn(name = "budget_id")  // Unidirectional relationship
    private List<BudgetLine> lines = new ArrayList<>();


    @OneToMany(mappedBy = "budget", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<History> historyRecords = new ArrayList<>();




    private BudgetLine getOrCreateLine(Currency currency) {
        return this.lines.stream()
                .filter(l -> l.getCurrency() == currency)
                .findFirst()
                .orElseGet(() -> {
                    BudgetLine newLine = new BudgetLine();
                    newLine.setCurrency(currency);
                    newLine.setAmount(BigDecimal.ZERO);
                    this.lines.add(newLine);
                    return newLine;
                });
    }

    // Business method for additions
    public void addFunds(Currency currency, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        getOrCreateLine(currency).setAmount(
                getOrCreateLine(currency).getAmount().add(amount)
        );
    }

    // Business method for deductions
    public void deductFunds(Currency currency, BigDecimal amount) {
        BudgetLine line = getOrCreateLine(currency);
        if (line.getAmount().compareTo(amount) < 0) {
            throw new InsufficientFundsException(
                    currency,  this.type,  line.getAmount(), amount
            );
        }
        line.setAmount(line.getAmount().subtract(amount));
    }

    // History record linkage
    public void addHistoryRecord(History history) {
        history.setBudget(this);
        this.historyRecords.add(history);
    }
}
