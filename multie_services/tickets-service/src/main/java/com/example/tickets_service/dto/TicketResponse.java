package com.example.tickets_service.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class TicketResponse {
    private Long id;
    private String name;
    private String trainNumber;
    private String fromStation;
    private String toStation;
    private BigDecimal price;
    private LocalDate date;
    private String description;
    private Integer totalQuantity; // Tổng số vé
    private Integer soldQuantity; // Số vé đã bán
    private Integer availableQuantity; // Số vé còn lại (computed)
    private String status;
    private LocalDateTime createdAt;
}
