package com.example.orders_service.repository;

import com.example.orders_service.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    // Có thể thêm method tìm theo userId nếu cần sau này
    // List<Order> findByUserRefId(Integer userId);
}
