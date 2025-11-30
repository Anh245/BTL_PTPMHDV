package com.example.orders_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for payment processing responses received from Payment Service.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long transactionId;
    private String status; // "SUCCESS", "FAILED", "PENDING"
    private String message;
}
