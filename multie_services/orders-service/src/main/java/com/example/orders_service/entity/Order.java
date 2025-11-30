package com.example.orders_service.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Tham chiếu User
    @Column(name = "user_ref_id", nullable = false)
    private Integer userRefId;

    @Column(name = "user_email_snapshot", length = 100)
    private String userEmailSnapshot;

    // Tham chiếu Lịch trình
    @Column(name = "schedule_ref_id", nullable = false)
    private Integer scheduleRefId;

    // Lưu JSON snapshot dưới dạng String (JPA basic)
    // Trong MySQL cột này sẽ là JSON hoặc TEXT
    @Column(name = "schedule_info_snapshot", columnDefinition = "JSON")
    private String scheduleInfoSnapshot;

    // Tham chiếu Loại vé
    @Column(name = "ticket_type_ref_id")
    private Integer ticketTypeRefId;

    @Column(name = "ticket_type_name_snapshot", length = 50)
    private String ticketTypeNameSnapshot;

    private Integer quantity;

    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status")
    private OrderStatus orderStatus;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // New fields for booking management
    @Column(name = "passenger_details", columnDefinition = "TEXT")
    private String passengerDetails;

    @Column(name = "confirmation_code", length = 50, unique = true)
    private String confirmationCode;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    // Enum definitions
    public enum PaymentMethod {
        cash, credit_card, ewallet
    }

    public enum PaymentStatus {
        pending, paid, failed, refunded
    }

    public enum OrderStatus {
        created, confirmed, cancelled
    }
}
