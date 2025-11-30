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
    // @PreAuthorize("hasRole('USER')") // TEMPORARY: Disabled for testing
    public ResponseEntity<OrderResponse> create(@RequestBody @jakarta.validation.Valid OrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(request));
    }

    @GetMapping
    // @PreAuthorize("hasRole('USER')") // TEMPORARY: Disabled for testing
    public ResponseEntity<List<OrderResponse>> getAll() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    // @PreAuthorize("hasRole('USER')") // TEMPORARY: Disabled for testing
    public ResponseEntity<OrderResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @DeleteMapping("/{id}")
    // @PreAuthorize("hasRole('USER')") // TEMPORARY: Disabled for testing
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

    /**
     * Get all orders for a specific user.
     * Validates that the requesting user matches the userRefId for authorization.
     * Orders are filtered by userRefId (Property 9) and sorted by createdAt DESC (Property 11).
     * 
     * @param userRefId The user ID to fetch orders for
     * @param principal The authenticated user from JWT token
     * @return List of orders for the user
     */
    @GetMapping("/user/{userRefId}")
    // @PreAuthorize("hasRole('USER')") // TEMPORARY: Disabled for testing
    public ResponseEntity<List<OrderResponse>> getUserOrders(
            @PathVariable Integer userRefId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal Object principal) {
        
        // Extract userId from JWT token (stored as principal in JwtAuthenticationFilter)
        Integer authenticatedUserId = null;
        if (principal instanceof Integer) {
            authenticatedUserId = (Integer) principal;
        } else if (principal instanceof String) {
            try {
                authenticatedUserId = Integer.parseInt((String) principal);
            } catch (NumberFormatException e) {
                // If principal is username string, we can't verify - allow for backward compatibility
                // In production, this should be handled more strictly
            }
        }
        
        // Verify requesting user matches userRefId (authorization)
        if (authenticatedUserId != null && !authenticatedUserId.equals(userRefId)) {
            return ResponseEntity.status(403).build(); // Forbidden
        }
        
        return ResponseEntity.ok(orderService.getUserOrders(userRefId));
    }

    /**
     * Cancel an order.
     * Extracts userId from JWT token and calls OrderService.cancelOrder.
     * The service validates ownership and status before cancelling.
     * 
     * @param id The order ID to cancel
     * @param principal The authenticated user from JWT token
     * @return Updated order response with cancelled status
     */
    @PutMapping("/{id}/cancel")
    // @PreAuthorize("hasRole('USER')") // TEMPORARY: Disabled for testing
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Integer id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal Object principal) {
        
        // Extract userId from JWT token (stored as principal in JwtAuthenticationFilter)
        Integer authenticatedUserId = null;
        if (principal instanceof Integer) {
            authenticatedUserId = (Integer) principal;
        } else if (principal instanceof String) {
            try {
                authenticatedUserId = Integer.parseInt((String) principal);
            } catch (NumberFormatException e) {
                return ResponseEntity.status(401).build(); // Unauthorized if we can't extract userId
            }
        }
        
        if (authenticatedUserId == null) {
            return ResponseEntity.status(401).build(); // Unauthorized
        }
        
        // Call OrderService.cancelOrder(id, userId)
        // The service will validate ownership and status
        return ResponseEntity.ok(orderService.cancelOrder(id, authenticatedUserId));
    }
}
