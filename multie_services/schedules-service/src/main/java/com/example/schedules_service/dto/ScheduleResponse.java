package com.example.schedules_service.dto;

import com.example.schedules_service.entity.Schedule;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ScheduleResponse {
    private Long id;
    private String trainNumber; // snapshot
    private String departureStation; // snapshot
    private String arrivalStation; // snapshot
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private Long durationMinutes; // Tính toán thời gian di chuyển
    private Schedule.Status status;
}
