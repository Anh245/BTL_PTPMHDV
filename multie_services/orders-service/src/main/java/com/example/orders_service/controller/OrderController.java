package com.example.orders_service.controller;

import com.example.orders_service.dto.OrderRequest;
import com.example.orders_service.dto.OrderResponse;
import com.example.orders_service.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<OrderResponse> create(@RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(request));
    }

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<OrderResponse>> getAll() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<OrderResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok("Xóa giao dịch thành công");
    }

    // Lưu ý: Để đơn giản cho demo, ta cho phép endpoint này public hoặc cần xử lý token nội bộ.
    // Ở đây tôi sẽ mở quyền public cho endpoint này trong SecurityConfig ở bước sau.
    @PutMapping("/{id}/confirm")
    public ResponseEntity<OrderResponse> confirmPayment(@PathVariable Integer id) {
        return ResponseEntity.ok(orderService.confirmPayment(id));
    }
}
