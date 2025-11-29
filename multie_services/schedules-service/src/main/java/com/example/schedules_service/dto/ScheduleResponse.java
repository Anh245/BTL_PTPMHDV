package com.example.schedules_service.dto;

import com.example.schedules_service.entity.Schedule;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ScheduleResponse {
    private Long id;
    private String trainNumber; // snapshot - for backward compatibility
    private String trainNumberSnapshot; // for tickets service
    private String departureStation; // snapshot - for backward compatibility
    private String departureStationNameSnapshot; // for tickets service
    private String arrivalStation; // snapshot - for backward compatibility
    private String arrivalStationNameSnapshot; // for tickets service
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private BigDecimal basePrice;
    private Long durationMinutes; // Tính toán thời gian di chuyển
    private Schedule.Status status;
}
