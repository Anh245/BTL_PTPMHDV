package com.example.payment_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Integer orderId; // Tham chiếu lỏng sang Orders Service

    private BigDecimal amount;

    @Column(name = "payment_method")
    private String paymentMethod; // VNPay, Momo...

    @Enumerated(EnumType.STRING)
    private Status status; // SUCCESS, FAILED, PENDING

    @Column(name = "transaction_date")
    private LocalDateTime transactionDate = LocalDateTime.now();

    // Log chi tiết để đối soát (Reconciliation)
    @Lob // Large Object để lưu chuỗi JSON dài
    @Column(name = "request_log", columnDefinition = "TEXT")
    private String requestLog;

    @Lob
    @Column(name = "response_log", columnDefinition = "TEXT")
    private String responseLog;

    public enum Status {
        SUCCESS, FAILED, PENDING
    }
}