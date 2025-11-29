package com.example.payment_service.repository;

import com.example.payment_service.entity.PaymentGateway;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PaymentGatewayRepository extends JpaRepository<PaymentGateway, Integer> {
    Optional<PaymentGateway> findByNameAndIsActiveTrue(String name);
}
