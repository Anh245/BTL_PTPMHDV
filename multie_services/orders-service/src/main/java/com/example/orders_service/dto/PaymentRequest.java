package com.example.orders_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for payment processing requests sent to Payment Service.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
    private Integer orderId;
    private BigDecimal amount;
    private String paymentMethod; // e.g., "VNPay", "Momo", "credit_card"
}
