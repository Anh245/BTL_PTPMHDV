package com.example.orders_service.service;

import com.example.orders_service.dto.OrderRequest;
import com.example.orders_service.dto.OrderResponse;

import java.util.List;

public interface OrderService {
    OrderResponse createOrder(OrderRequest request);
    List<OrderResponse> getAllOrders();
    OrderResponse getOrderById(Integer id);
    void deleteOrder(Integer id);
    OrderResponse confirmPayment(Integer id);
}