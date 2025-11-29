package com.example.tickets_service.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ScheduleResponse {
    private Long id;
    private String trainNumberSnapshot;
    private String departureStationNameSnapshot;
    private String arrivalStationNameSnapshot;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private String status;
}
