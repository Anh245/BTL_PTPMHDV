package com.example.tickets_service.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class BookingResponse {
    private Long id;
    private Integer orderRefId;
    private Integer userRefId;
    private Long scheduleRefId;
    private Long ticketRefId;
    
    // Thông tin hành khách
    private String passengerName;
    private String passengerEmail;
    private String passengerPhone;
    private String passengerIdNumber;
    
    // Thông tin vé
    private String seatNumber;
    private String ticketCode;
    private BigDecimal price;
    
    // Snapshot data
    private String trainNumberSnapshot;
    private String departureStationSnapshot;
    private String arrivalStationSnapshot;
    private LocalDateTime departureTimeSnapshot;
    
    // Trạng thái
    private String status;
    private LocalDateTime bookingDate;
    private LocalDateTime createdAt;
}
