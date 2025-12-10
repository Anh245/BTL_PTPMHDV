package com.example.schedules_service.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "schedules")
public class Schedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // Tham chiếu tàu (Snapshot)
    @Column(name = "train_ref_id", nullable = false)
    private Long trainRefId;
    @Column(name = "train_number_snapshot", nullable = false)
    private String trainNumberSnapshot;
    // Tham chiếu ga đi (Snapshot)
    @Column(name = "departure_station_ref_id", nullable = false)
    private Long departureStationRefId;
    @Column(name = "departure_station_name_snapshot", nullable = false)
    private String departureStationNameSnapshot;
    // Tham chiếu ga đến (Snapshot)
    @Column(name = "arrival_station_ref_id", nullable = false)
    private Long arrivalStationRefId;
    @Column(name = "arrival_station_name_snapshot", nullable = false)
    private String arrivalStationNameSnapshot;
    // Thời gian & Giá vé
    @Column(name = "departure_time", nullable = false)
    private LocalDateTime departureTime;
    @Column(name = "arrival_time", nullable = false)
    private LocalDateTime arrivalTime;
    @Enumerated(EnumType.STRING)
    private Status status;
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    public enum Status {
        scheduled, departed, delayed, cancelled
    }
}
