package com.example.orders_service.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TicketResponse {
    private Long id;
    private String name;
    
    // Schedule reference
    private Long scheduleRefId;
    
    // Snapshot data
    private String trainNumberSnapshot;
    private String routeSnapshot;
    private LocalDateTime departureTimeSnapshot;
    
    private BigDecimal price;
    private String description;
    private Integer totalQuantity;
    private Integer soldQuantity;
    private Integer availableQuantity;
    private String status;
    private LocalDateTime createdAt;
}
