package com.example.core.expenseRequest;

import java.util.Map;

public record ApproveDto(
        String comment,
        Map<String, Double> approvedAmounts
) {}