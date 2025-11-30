package com.example.tickets_service.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TicketResponse {
    private Long id;
    private String name;
    private Long scheduleRefId;
    private String trainNumberSnapshot;
    private String routeSnapshot;
    private LocalDateTime departureTimeSnapshot;
    private BigDecimal price;
    private String description;
    private Integer totalQuantity; // Tổng số vé
    private Integer soldQuantity; // Số vé đã bán
    private Integer availableQuantity; // Số vé còn lại (computed)
    private String status;
    private LocalDateTime createdAt;
}
