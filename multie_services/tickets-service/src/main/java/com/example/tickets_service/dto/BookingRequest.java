package com.example.tickets_service.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class BookingRequest {
    private Integer orderRefId;
    private Integer userRefId;
    private Long scheduleRefId;
    private Long ticketRefId;
    private String passengerName;
    private String passengerEmail;
    private String passengerPhone;
    private String passengerIdNumber;
    private String seatNumber;
    private BigDecimal price;
    private String trainNumberSnapshot;
    private String departureStationSnapshot;
    private String arrivalStationSnapshot;
    private LocalDateTime departureTimeSnapshot;
}
