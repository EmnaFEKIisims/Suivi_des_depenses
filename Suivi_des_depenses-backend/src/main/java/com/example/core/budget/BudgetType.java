package com.example.core.budget;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum BudgetType {
    BANK ,
    CASH;


    @JsonCreator
    public static BudgetType fromString(String value) {
        return BudgetType.valueOf(value.toUpperCase());
    }
}
