package com.example.payment_service.dto;

import lombok.Data;

@Data
public class PaymentResponse {
    private Long transactionId;
    private String status;
    private String message;
}