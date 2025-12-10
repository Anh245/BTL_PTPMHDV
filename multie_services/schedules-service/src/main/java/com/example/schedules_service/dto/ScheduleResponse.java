package com.example.schedules_service.dto;

import com.example.schedules_service.entity.Schedule;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
    private Long durationMinutes;
    private Schedule.Status status;
}
