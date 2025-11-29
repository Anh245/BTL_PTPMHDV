package com.example.payment_service.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentRequest {
    private Integer orderId;
    private BigDecimal amount;
    private String paymentMethod; // VD: "VNPay"
}