package com.example.orders_service.controller;

import com.example.orders_service.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/orders/summary")
    public ResponseEntity<Map<String, Object>> getOrdersSummary() {
        return ResponseEntity.ok(analyticsService.getOrdersSummary());
    }

    @GetMapping("/orders/by-date")
    public ResponseEntity<Map<String, Object>> getOrdersByDate(
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(analyticsService.getOrdersByDate(days));
    }

    @GetMapping("/revenue/summary")
    public ResponseEntity<Map<String, Object>> getRevenueSummary() {
        return ResponseEntity.ok(analyticsService.getRevenueSummary());
    }

    @GetMapping("/orders/by-status")
    public ResponseEntity<Map<String, Object>> getOrdersByStatus() {
        return ResponseEntity.ok(analyticsService.getOrdersByStatus());
    }

    @GetMapping("/orders/by-payment-method")
    public ResponseEntity<Map<String, Object>> getOrdersByPaymentMethod() {
        return ResponseEntity.ok(analyticsService.getOrdersByPaymentMethod());
    }
}