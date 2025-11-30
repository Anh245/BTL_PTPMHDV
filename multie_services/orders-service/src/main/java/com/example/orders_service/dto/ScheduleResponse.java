package com.example.orders_service.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for Schedule information received from Schedules Service.
 * Used to create snapshot data when creating orders.
 */
@Data
public class ScheduleResponse {
    private Long id;
    private String trainNumber;
    private String trainNumberSnapshot;
    private String departureStation;
    private String departureStationNameSnapshot;
    private String arrivalStation;
    private String arrivalStationNameSnapshot;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private BigDecimal basePrice;
    private Long durationMinutes;
    private String status;
}
