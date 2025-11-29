package com.example.schedules_service.dto;

import com.example.schedules_service.entity.Schedule;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ScheduleRequest {
    private Long trainRefId;
    private String trainNumberSnapshot;

    private Long departureStationRefId;
    private String departureStationNameSnapshot;

    private Long arrivalStationRefId;
    private String arrivalStationNameSnapshot;

    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;

    private BigDecimal basePrice;

    private Schedule.Status status;
}
