package com.example.orders_service.dto;

import lombok.Data;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.DecimalMin;

import java.math.BigDecimal;

@Data
public class OrderRequest {
    // Thông tin người dùng
    @NotNull(message = "User reference ID is required")
    private Integer userRefId;
    
    private String userEmailSnapshot;

    // Thông tin lịch trình
    @NotNull(message = "Schedule reference ID is required")
    private Integer scheduleRefId;
    
    // Client có thể gửi JSON object, ta sẽ convert sang String để lưu DB
    // Hoặc Client gửi chuỗi String JSON
    private String scheduleInfoSnapshot;

    // Thông tin vé
    @NotNull(message = "Ticket type reference ID is required")
    private Integer ticketTypeRefId;
    
    private String ticketTypeNameSnapshot;
    
    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than 0")
    private Integer quantity;
    
    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Total amount must be greater than 0")
    private BigDecimal totalAmount;

    // Phương thức thanh toán (nhận chuỗi, validate sau hoặc dùng Enum)
    @NotEmpty(message = "Payment method is required")
    private String paymentMethod;

    // Thông tin hành khách (JSON array)
    @NotNull(message = "Passenger details are required")
    @NotEmpty(message = "Passenger details cannot be empty")
    private String passengerDetails;
}
