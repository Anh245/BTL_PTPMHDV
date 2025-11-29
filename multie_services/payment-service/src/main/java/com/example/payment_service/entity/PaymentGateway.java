package com.example.payment_service.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "payment_gateways")
@Data
public class PaymentGateway {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String name; // VNPay, Momo, Stripe

    @Column(name = "api_key_public")
    private String apiKeyPublic;
    // Tuyệt đối không lưu Secret Key ở đây (thường sẽ để trong biến môi trường hoặc Vault)

    @Column(name = "is_active")
    private Boolean isActive = true;
}
