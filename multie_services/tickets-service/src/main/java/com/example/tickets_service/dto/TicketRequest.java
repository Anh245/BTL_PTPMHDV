package com.example.tickets_service.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TicketRequest {
    private String name;
    private String trainNumber;
    private String fromStation;
    private String toStation;
    private BigDecimal price;
    private LocalDate date;
    private String description;
    private Integer totalQuantity; // Tổng số vé có thể bán
    private Integer soldQuantity; // Số vé đã bán (optional, mặc định 0)
    private String status; // "active", "inactive", "sold_out"
}
