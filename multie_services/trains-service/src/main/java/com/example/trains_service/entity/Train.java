package com.example.trains_service.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "trains")
public class Train {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name; // Unity Expres
    @Column(unique = true, nullable = false)
    private String trainNumber; // SE1
    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats; // Tổng số ghế
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    public enum Status {
        active, inactive, maintenance
    }
}
