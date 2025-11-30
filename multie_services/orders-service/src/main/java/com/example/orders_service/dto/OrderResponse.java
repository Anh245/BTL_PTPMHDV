package com.example.orders_service.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrderResponse {
    private Integer id;

    private Integer userRefId;
    private String userEmailSnapshot;

    private Integer scheduleRefId;
    private String scheduleInfoSnapshot;

    private Integer ticketTypeRefId;
    private String ticketTypeNameSnapshot;

    private Integer quantity;
    private BigDecimal totalAmount;

    private String paymentMethod;
    private String paymentStatus;
    private String orderStatus;

    private LocalDateTime createdAt;
    
    // New fields for booking management
    private String passengerDetails;
    private String confirmationCode;
    private LocalDateTime confirmedAt;
}
