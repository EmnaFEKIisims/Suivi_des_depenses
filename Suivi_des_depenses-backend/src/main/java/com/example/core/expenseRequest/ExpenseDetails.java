package com.example.core.expenseRequest;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "expense_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String currency; // USD, EUR, TND...

    @Column(name = "currency_description")
    private String currencyDescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_request_id")
    @JsonBackReference
    private ExpenseRequest expenseRequest;

}
