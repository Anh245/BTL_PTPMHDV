package com.example.orders_service.repository;

import com.example.orders_service.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    // Find orders by user ID
    List<Order> findByUserRefIdOrderByCreatedAtDesc(Integer userRefId);
    
    // Find order by ID and user ID (for authorization)
    Optional<Order> findByIdAndUserRefId(Integer id, Integer userRefId);
    
    // Find orders by ticket type
    List<Order> findByTicketTypeRefId(Integer ticketTypeRefId);
    
    // Find orders by schedule
    List<Order> findByScheduleRefId(Integer scheduleRefId);
    
    // Find order by confirmation code
    Optional<Order> findByConfirmationCode(String confirmationCode);
    
    // Analytics methods
    List<Order> findByCreatedAtAfter(LocalDateTime date);
    List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
