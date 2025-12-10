package com.example.schedules_service.dto;

import com.example.schedules_service.entity.Schedule;
import jakarta.validation.constraints.AssertTrue;
import lombok.Data;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ScheduleRequest {
    @NotNull(message = "Mã tàu không được để trống")
    private Long trainRefId;
    private String trainNumberSnapshot;

    @NotNull(message = "Ga đi không được để trống")
    private Long departureStationRefId;
    private String departureStationNameSnapshot;

    @NotNull(message = "Ga đến không được để trống")
    private Long arrivalStationRefId;
    private String arrivalStationNameSnapshot;

    @NotNull(message = "Thời gian khởi hành không được bỏ trống")
    private LocalDateTime departureTime;

    @NotNull(message = "Thời gian đến không được bỏ trống")
    private LocalDateTime arrivalTime;

    private Schedule.Status status;
    @AssertTrue(message = "Thời gian đến phải sau thời gian đi")
    private boolean isArrivalTimeValid() {
        if (departureTime == null || arrivalTime == null) {
            return true; // Để @NotNull xử lý trường hợp null
        }
        return arrivalTime.isAfter(departureTime);
    }
}
