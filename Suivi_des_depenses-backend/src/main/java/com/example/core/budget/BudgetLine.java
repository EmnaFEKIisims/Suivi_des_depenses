package com.example.core.budget;


import com.example.core.expenseRequest.Currency;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "budget_lines")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetLine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 3)
    private Currency currency;

    @Column(name = "currency_description")
    private String currencyDescription;

    @Column(nullable = false, precision = 19, scale = 4)  // Allows for 15 digits + 4 decimal places
    private BigDecimal amount;
}
