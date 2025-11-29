package com.example.orders_service.service.impl;

import com.example.orders_service.dto.OrderRequest;
import com.example.orders_service.dto.OrderResponse;
import com.example.orders_service.entity.Order;
import com.example.orders_service.exception.NotFoundException;
import com.example.orders_service.repository.OrderRepository;
import com.example.orders_service.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;

    @Override
    public OrderResponse createOrder(OrderRequest request) {
        Order order = new Order();

        // Map từ Request -> Entity
        order.setUserRefId(request.getUserRefId());
        order.setUserEmailSnapshot(request.getUserEmailSnapshot());
        order.setScheduleRefId(request.getScheduleRefId());
        order.setScheduleInfoSnapshot(request.getScheduleInfoSnapshot());
        order.setTicketTypeRefId(request.getTicketTypeRefId());
        order.setTicketTypeNameSnapshot(request.getTicketTypeNameSnapshot());
        order.setQuantity(request.getQuantity());
        order.setTotalAmount(request.getTotalAmount());

        // Xử lý Enum an toàn
        try {
            order.setPaymentMethod(Order.PaymentMethod.valueOf(request.getPaymentMethod()));
        } catch (IllegalArgumentException | NullPointerException e) {
            // Mặc định hoặc ném lỗi nếu value sai
            order.setPaymentMethod(Order.PaymentMethod.cash);
        }

        // Set giá trị mặc định
        order.setPaymentStatus(Order.PaymentStatus.pending);
        order.setOrderStatus(Order.OrderStatus.created);
        order.setCreatedAt(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);
        return mapToResponse(savedOrder);
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public OrderResponse getOrderById(Integer id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy giao dịch với id: " + id));
        return mapToResponse(order);
    }

    @Override
    public void deleteOrder(Integer id) {
        if (!orderRepository.existsById(id)) {
            throw new NotFoundException("Không tìm thấy giao dịch để xóa với id: " + id);
        }
        orderRepository.deleteById(id);
    }

    @Override
    public OrderResponse confirmPayment(Integer id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Order not found: " + id));

        order.setPaymentStatus(Order.PaymentStatus.paid);
        order.setOrderStatus(Order.OrderStatus.confirmed);

        return mapToResponse(orderRepository.save(order));
    }

    // Hàm helper để map Entity -> Response
    private OrderResponse mapToResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setUserRefId(order.getUserRefId());
        response.setUserEmailSnapshot(order.getUserEmailSnapshot());
        response.setScheduleRefId(order.getScheduleRefId());
        response.setScheduleInfoSnapshot(order.getScheduleInfoSnapshot());
        response.setTicketTypeRefId(order.getTicketTypeRefId());
        response.setTicketTypeNameSnapshot(order.getTicketTypeNameSnapshot());
        response.setQuantity(order.getQuantity());
        response.setTotalAmount(order.getTotalAmount());

        if (order.getPaymentMethod() != null) response.setPaymentMethod(order.getPaymentMethod().name());
        if (order.getPaymentStatus() != null) response.setPaymentStatus(order.getPaymentStatus().name());
        if (order.getOrderStatus() != null) response.setOrderStatus(order.getOrderStatus().name());

        response.setCreatedAt(order.getCreatedAt());
        return response;
    }
}
