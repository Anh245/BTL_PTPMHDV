package com.example.orders_service.service;

import com.example.orders_service.entity.Order;
import com.example.orders_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final OrderRepository orderRepository;

    public Map<String, Object> getOrdersSummary() {
        List<Order> orders = orderRepository.findAll();
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalOrders", orders.size());
        summary.put("confirmedOrders", orders.stream()
            .filter(o -> o.getOrderStatus() == Order.OrderStatus.confirmed)
            .count());
        summary.put("cancelledOrders", orders.stream()
            .filter(o -> o.getOrderStatus() == Order.OrderStatus.cancelled)
            .count());
        summary.put("pendingOrders", orders.stream()
            .filter(o -> o.getOrderStatus() == Order.OrderStatus.created)
            .count());
        
        return summary;
    }

    public Map<String, Object> getOrdersByDate(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<Order> orders = orderRepository.findByCreatedAtAfter(startDate);
        
        Map<LocalDate, Long> ordersByDate = orders.stream()
            .collect(Collectors.groupingBy(
                order -> order.getCreatedAt().toLocalDate(),
                Collectors.counting()
            ));
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", ordersByDate);
        result.put("period", days + " days");
        
        return result;
    }

    public Map<String, Object> getRevenueSummary() {
        List<Order> orders = orderRepository.findAll();
        
        BigDecimal totalRevenue = orders.stream()
            .filter(o -> o.getPaymentStatus() == Order.PaymentStatus.paid)
            .map(Order::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal pendingRevenue = orders.stream()
            .filter(o -> o.getPaymentStatus() == Order.PaymentStatus.pending)
            .map(Order::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalRevenue", totalRevenue);
        summary.put("pendingRevenue", pendingRevenue);
        summary.put("paidOrders", orders.stream()
            .filter(o -> o.getPaymentStatus() == Order.PaymentStatus.paid)
            .count());
        summary.put("pendingPayments", orders.stream()
            .filter(o -> o.getPaymentStatus() == Order.PaymentStatus.pending)
            .count());
        
        return summary;
    }

    public Map<String, Object> getOrdersByStatus() {
        List<Order> orders = orderRepository.findAll();
        
        Map<Order.OrderStatus, Long> statusCount = orders.stream()
            .collect(Collectors.groupingBy(
                Order::getOrderStatus,
                Collectors.counting()
            ));
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", statusCount);
        result.put("total", orders.size());
        
        return result;
    }

    public Map<String, Object> getOrdersByPaymentMethod() {
        List<Order> orders = orderRepository.findAll();
        
        Map<Order.PaymentMethod, Long> methodCount = orders.stream()
            .filter(o -> o.getPaymentMethod() != null)
            .collect(Collectors.groupingBy(
                Order::getPaymentMethod,
                Collectors.counting()
            ));
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", methodCount);
        result.put("total", orders.size());
        
        return result;
    }
}