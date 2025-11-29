package com.example.tickets_service.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Data
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100, nullable = false)
    private String name;

    // Tham chiếu đến Schedule
    @Column(name = "schedule_ref_id", nullable = false)
    private Long scheduleRefId;

    // Snapshot data từ Schedule
    @Column(name = "train_number_snapshot", length = 20, nullable = false)
    private String trainNumberSnapshot;

    @Column(name = "route_snapshot", length = 200, nullable = false)
    private String routeSnapshot; // "Hà Nội → Sài Gòn"

    @Column(name = "departure_time_snapshot", nullable = false)
    private LocalDateTime departureTimeSnapshot;

    @Column(name = "price", precision = 12, scale = 2, nullable = false)
    private BigDecimal price;

    @Column(name = "description", length = 500)
    private String description;

    // Quản lý số lượng vé
    @Column(name = "total_quantity", nullable = false)
    private Integer totalQuantity = 0; // Tổng số vé có thể bán

    @Column(name = "sold_quantity", nullable = false)
    private Integer soldQuantity = 0; // Số vé đã bán

    @Enumerated(EnumType.STRING)
    private Status status = Status.active;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Status {
        active, inactive, sold_out
    }

    // Helper method để tính số vé còn lại
    public Integer getAvailableQuantity() {
        return totalQuantity - soldQuantity;
    }

    // Helper method để kiểm tra còn vé không
    public boolean hasAvailableTickets() {
        return getAvailableQuantity() > 0;
    }
}
