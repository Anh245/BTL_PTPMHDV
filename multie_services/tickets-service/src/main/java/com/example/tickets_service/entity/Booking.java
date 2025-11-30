package com.example.tickets_service.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tham chiếu Order
    @Column(name = "order_ref_id", nullable = false)
    private Integer orderRefId;

    // Tham chiếu User
    @Column(name = "user_ref_id", nullable = false)
    private Integer userRefId;

    // Tham chiếu Schedule
    @Column(name = "schedule_ref_id", nullable = false)
    private Long scheduleRefId;

    // Tham chiếu Ticket (loại vé)
    @Column(name = "ticket_ref_id", nullable = false)
    private Long ticketRefId;

    // Thông tin hành khách
    @Column(name = "passenger_name", length = 100, nullable = false)
    private String passengerName;

    @Column(name = "passenger_email", length = 100)
    private String passengerEmail;

    @Column(name = "passenger_phone", length = 20)
    private String passengerPhone;

    @Column(name = "passenger_id_number", length = 50)
    private String passengerIdNumber;

    // Thông tin vé
    @Column(name = "seat_number", length = 10)
    private String seatNumber;

    @Column(name = "ticket_code", length = 50, unique = true)
    private String ticketCode;  // Mã vé để check-in

    @Column(name = "price", precision = 12, scale = 2, nullable = false)
    private BigDecimal price;

    // Snapshot thông tin schedule (để hiển thị khi schedule bị xóa)
    @Column(name = "train_number_snapshot", length = 20)
    private String trainNumberSnapshot;

    @Column(name = "departure_station_snapshot", length = 100)
    private String departureStationSnapshot;

    @Column(name = "arrival_station_snapshot", length = 100)
    private String arrivalStationSnapshot;

    @Column(name = "departure_time_snapshot")
    private LocalDateTime departureTimeSnapshot;

    // Trạng thái
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status = Status.confirmed;

    @Column(name = "booking_date", nullable = false)
    private LocalDateTime bookingDate = LocalDateTime.now();

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Status {
        confirmed,   // Đã xác nhận
        cancelled,   // Đã hủy
        used,        // Đã sử dụng (đã check-in)
        expired      // Hết hạn
    }

    // Helper method để generate ticket code
    public static String generateTicketCode(Long scheduleId, String seatNumber) {
        return String.format("VT-%d-%s-%d", 
            scheduleId, 
            seatNumber, 
            System.currentTimeMillis() % 10000
        );
    }
}
