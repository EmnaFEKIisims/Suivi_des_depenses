package com.example.core.exceptions;

public class BusinessException extends RuntimeException {  // Changed from Exception to RuntimeException
    public BusinessException(String message) {
        super(message);
    }

    public BusinessException(String message, Throwable cause) {
        super(message, cause);
    }
}