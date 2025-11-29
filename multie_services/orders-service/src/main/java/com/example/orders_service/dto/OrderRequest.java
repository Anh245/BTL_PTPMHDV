package com.example.orders_service.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderRequest {
    // Thông tin người dùng
    private Integer userRefId;
    private String userEmailSnapshot;

    // Thông tin lịch trình
    private Integer scheduleRefId;
    // Client có thể gửi JSON object, ta sẽ convert sang String để lưu DB
    // Hoặc Client gửi chuỗi String JSON
    private String scheduleInfoSnapshot;

    // Thông tin vé
    private Integer ticketTypeRefId;
    private String ticketTypeNameSnapshot;
    private Integer quantity;
    private BigDecimal totalAmount;

    // Phương thức thanh toán (nhận chuỗi, validate sau hoặc dùng Enum)
    private String paymentMethod;
}
