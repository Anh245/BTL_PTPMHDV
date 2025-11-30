package com.example.orders_service.service.impl;

import com.example.orders_service.client.PaymentServiceClient;
import com.example.orders_service.client.ScheduleServiceClient;
import com.example.orders_service.client.TicketsServiceClient;
import com.example.orders_service.dto.OrderRequest;
import com.example.orders_service.dto.OrderResponse;
import com.example.orders_service.dto.PaymentRequest;
import com.example.orders_service.dto.PaymentResponse;
import com.example.orders_service.dto.ScheduleResponse;
import com.example.orders_service.dto.TicketResponse;
import com.example.orders_service.entity.Order;
import com.example.orders_service.exception.InsufficientTicketsException;
import com.example.orders_service.exception.NotFoundException;
import com.example.orders_service.exception.ServiceUnavailableException;
import com.example.orders_service.exception.ValidationException;
import com.example.orders_service.repository.OrderRepository;
import com.example.orders_service.service.OrderService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final TicketsServiceClient ticketsServiceClient;
    private final PaymentServiceClient paymentServiceClient;
    private final ScheduleServiceClient scheduleServiceClient;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        log.info("Creating order for user: {}, ticket: {}, quantity: {}", 
                request.getUserRefId(), request.getTicketTypeRefId(), request.getQuantity());

        // Step 1: Get ticket information from Tickets Service
        TicketResponse ticket;
        try {
            ticket = ticketsServiceClient.getTicket(request.getTicketTypeRefId());
        } catch (RestClientException e) {
            log.error("Failed to fetch ticket information: {}", e.getMessage());
            throw new ServiceUnavailableException("Tickets service is temporarily unavailable", e);
        }

        // Step 2: Validate requested quantity against available quantity (Property 2)
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new ValidationException("Quantity must be greater than 0");
        }

        if (ticket.getAvailableQuantity() == null || request.getQuantity() > ticket.getAvailableQuantity()) {
            throw new InsufficientTicketsException(
                String.format("Insufficient tickets available. Requested: %d, Available: %d", 
                    request.getQuantity(), 
                    ticket.getAvailableQuantity() != null ? ticket.getAvailableQuantity() : 0)
            );
        }

        // Step 3: Calculate total amount (ticket price × quantity) (Property 3)
        BigDecimal calculatedAmount = ticket.getPrice().multiply(new BigDecimal(request.getQuantity()));
        
        // Validate that the provided total amount matches the calculated amount
        if (request.getTotalAmount() != null && request.getTotalAmount().compareTo(calculatedAmount) != 0) {
            log.warn("Total amount mismatch. Provided: {}, Calculated: {}", request.getTotalAmount(), calculatedAmount);
        }

        // Step 4: Parse and validate passenger details JSON
        if (request.getPassengerDetails() != null && !request.getPassengerDetails().trim().isEmpty()) {
            try {
                JsonNode passengerNode = objectMapper.readTree(request.getPassengerDetails());
                if (!passengerNode.isArray()) {
                    throw new ValidationException("Passenger details must be a JSON array");
                }
                // Additional validation: check if array has the right number of passengers
                if (passengerNode.size() != request.getQuantity()) {
                    log.warn("Passenger details count ({}) does not match quantity ({})", 
                            passengerNode.size(), request.getQuantity());
                }
            } catch (Exception e) {
                throw new ValidationException("Invalid passenger details JSON format: " + e.getMessage());
            }
        }

        // Step 5: Fetch schedule information and create snapshot (Property 20)
        String scheduleInfoSnapshot = null;
        if (request.getScheduleRefId() != null) {
            try {
                ScheduleResponse schedule = scheduleServiceClient.getSchedule(request.getScheduleRefId());
                scheduleInfoSnapshot = createScheduleSnapshot(schedule);
                log.info("Successfully created schedule snapshot for scheduleId: {}", request.getScheduleRefId());
            } catch (RestClientException e) {
                log.error("Failed to fetch schedule information for scheduleId: {}. Error: {}", 
                        request.getScheduleRefId(), e.getMessage());
                throw new ServiceUnavailableException("Schedules service is temporarily unavailable. Cannot create order at this time.", e);
            }
        }

        // Step 6: Create order entity
        Order order = new Order();
        order.setUserRefId(request.getUserRefId());
        order.setUserEmailSnapshot(request.getUserEmailSnapshot());
        order.setScheduleRefId(request.getScheduleRefId());
        order.setScheduleInfoSnapshot(scheduleInfoSnapshot); // Use generated snapshot
        order.setTicketTypeRefId(request.getTicketTypeRefId());
        order.setTicketTypeNameSnapshot(request.getTicketTypeNameSnapshot());
        order.setQuantity(request.getQuantity());
        order.setTotalAmount(calculatedAmount); // Use calculated amount
        order.setPassengerDetails(request.getPassengerDetails());

        // Handle payment method enum safely
        try {
            order.setPaymentMethod(Order.PaymentMethod.valueOf(request.getPaymentMethod()));
        } catch (IllegalArgumentException | NullPointerException e) {
            order.setPaymentMethod(Order.PaymentMethod.cash);
        }

        // Set initial status to 'created' and payment status to 'pending'
        order.setPaymentStatus(Order.PaymentStatus.pending);
        order.setOrderStatus(Order.OrderStatus.created);
        order.setCreatedAt(LocalDateTime.now());

        // Step 7: Save order to database
        Order savedOrder = orderRepository.save(order);
        log.info("Order created with ID: {}", savedOrder.getId());

        // Step 8: Decrease ticket quantity (Property 4)
        // Implement compensation logic - if this fails, the transaction will rollback
        try {
            ticketsServiceClient.decreaseTicketQuantity(request.getTicketTypeRefId(), request.getQuantity());
            log.info("Successfully decreased ticket quantity for ticket: {}", request.getTicketTypeRefId());
        } catch (RestClientException e) {
            log.error("Failed to decrease ticket quantity, rolling back order creation: {}", e.getMessage());
            // Transaction will automatically rollback the order creation
            throw new ServiceUnavailableException("Failed to reserve tickets. Order creation cancelled.", e);
        }

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
    @Transactional
    public OrderResponse confirmPayment(Integer id) {
        log.info("Confirming payment for order: {}", id);

        // Step 1: Get order
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Order not found: " + id));

        // Step 2: Validate order status is 'created' (Property 19)
        if (order.getOrderStatus() != Order.OrderStatus.created) {
            throw new ValidationException(
                String.format("Cannot confirm payment for order in %s status. Order must be in created status.", 
                    order.getOrderStatus())
            );
        }

        // Step 3: Process payment (call Payment Service)
        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setOrderId(id);
        paymentRequest.setAmount(order.getTotalAmount());
        paymentRequest.setPaymentMethod(order.getPaymentMethod() != null ? 
            order.getPaymentMethod().name() : "cash");

        PaymentResponse paymentResponse;
        try {
            paymentResponse = paymentServiceClient.processPayment(paymentRequest);
        } catch (RestClientException e) {
            log.error("Failed to process payment for order: {}. Error: {}", id, e.getMessage());
            throw new ServiceUnavailableException("Payment service is temporarily unavailable", e);
        }

        // Step 4: Update order based on payment result
        if ("SUCCESS".equals(paymentResponse.getStatus())) {
            // Payment SUCCESS: update payment status to 'paid' (Property 16)
            order.setPaymentStatus(Order.PaymentStatus.paid);
            
            // Payment SUCCESS: update order status to 'confirmed' (Property 17)
            order.setOrderStatus(Order.OrderStatus.confirmed);
            
            // Payment SUCCESS: generate unique confirmation code (UUID-based) (Property 18)
            order.setConfirmationCode(generateConfirmationCode());
            
            // Payment SUCCESS: set confirmedAt timestamp (Property 18)
            order.setConfirmedAt(LocalDateTime.now());
            
            log.info("Payment successful for order: {}. Confirmation code: {}", 
                    id, order.getConfirmationCode());
            
            // Note: Quantity is not changed on success (Property 5)
            // Quantity was already decreased during order creation
            
        } else {
            // Payment FAILED: update payment status to 'failed'
            order.setPaymentStatus(Order.PaymentStatus.failed);
            
            log.warn("Payment failed for order: {}. Status: {}, Message: {}", 
                    id, paymentResponse.getStatus(), paymentResponse.getMessage());
            
            // Payment FAILED: restore ticket quantity (call TicketsServiceClient)
            try {
                ticketsServiceClient.increaseTicketQuantity(
                    order.getTicketTypeRefId(), 
                    order.getQuantity()
                );
                log.info("Successfully restored ticket quantity for failed payment. Order: {}, Ticket: {}", 
                        id, order.getTicketTypeRefId());
            } catch (RestClientException e) {
                log.error("Failed to restore ticket quantity after payment failure for order: {}. Error: {}", 
                        id, e.getMessage());
                // Continue with order update even if quantity restoration fails
                // This should be handled by a compensation mechanism or manual intervention
            }
        }

        // Step 5: Save the updated order
        Order savedOrder = orderRepository.save(order);
        log.info("Order payment confirmation completed for order: {}. Payment status: {}, Order status: {}", 
                id, savedOrder.getPaymentStatus(), savedOrder.getOrderStatus());

        return mapToResponse(savedOrder);
    }

    /**
     * Generates a unique confirmation code for confirmed orders.
     * Format: BK-XXXXXXXX (where X is uppercase alphanumeric)
     * 
     * @return Unique confirmation code
     */
    private String generateConfirmationCode() {
        return "BK-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(Integer orderId, Integer userId) {
        log.info("Cancelling order: {} for user: {}", orderId, userId);

        // Step 1: Fetch the order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found with ID: " + orderId));

        // Step 2: Verify order belongs to requesting user (Property 12)
        if (!order.getUserRefId().equals(userId)) {
            log.warn("User {} attempted to cancel order {} belonging to user {}", 
                    userId, orderId, order.getUserRefId());
            throw new ValidationException("You are not authorized to cancel this order");
        }

        // Step 3: Validate order status is 'created' or 'confirmed' (Property 13)
        if (order.getOrderStatus() != Order.OrderStatus.created && 
            order.getOrderStatus() != Order.OrderStatus.confirmed) {
            throw new ValidationException(
                String.format("Cannot cancel order in %s status", order.getOrderStatus())
            );
        }

        // Step 4: Update order status to 'cancelled' (Property 14)
        order.setOrderStatus(Order.OrderStatus.cancelled);

        // Step 5: If payment status is 'paid', update to 'refunded' (Property 15)
        if (order.getPaymentStatus() == Order.PaymentStatus.paid) {
            order.setPaymentStatus(Order.PaymentStatus.refunded);
            log.info("Payment status updated to refunded for order: {}", orderId);
        }

        // Step 6: Save the order with updated status
        Order savedOrder = orderRepository.save(order);
        log.info("Order status updated to cancelled for order: {}", orderId);

        // Step 7: Call TicketsServiceClient to increase quantity (Property 6)
        try {
            ticketsServiceClient.increaseTicketQuantity(order.getTicketTypeRefId(), order.getQuantity());
            log.info("Successfully restored ticket quantity for ticket: {}", order.getTicketTypeRefId());
        } catch (RestClientException e) {
            log.error("Failed to restore ticket quantity for order: {}. Error: {}", orderId, e.getMessage());
            // Note: Order is already marked as cancelled in DB due to @Transactional
            // In a production system, you might want to implement a compensation mechanism
            // or retry logic here
            throw new ServiceUnavailableException(
                "Order cancelled but failed to restore ticket quantity. Please contact support.", e
            );
        }

        return mapToResponse(savedOrder);
    }

    @Override
    public List<OrderResponse> getUserOrders(Integer userRefId) {
        log.info("Fetching orders for user: {}", userRefId);
        
        // Filter orders by userRefId (Property 9) and sort by createdAt DESC (Property 11)
        List<Order> orders = orderRepository.findByUserRefIdOrderByCreatedAtDesc(userRefId);
        
        log.info("Found {} orders for user: {}", orders.size(), userRefId);
        
        return orders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Creates a JSON snapshot of schedule information.
     * Snapshot includes: train number, route (departure and arrival stations), 
     * departure time, and departure date.
     * This ensures order information remains consistent even if schedule is modified later.
     * 
     * @param schedule ScheduleResponse from Schedules Service
     * @return JSON string containing snapshot data
     */
    private String createScheduleSnapshot(ScheduleResponse schedule) {
        try {
            Map<String, Object> snapshot = new HashMap<>();
            
            // Train number (Property 20 - Requirement 6.1)
            snapshot.put("trainNumber", schedule.getTrainNumberSnapshot() != null ? 
                    schedule.getTrainNumberSnapshot() : schedule.getTrainNumber());
            
            // Route information (Property 20 - Requirement 6.2)
            String departureStation = schedule.getDepartureStationNameSnapshot() != null ? 
                    schedule.getDepartureStationNameSnapshot() : schedule.getDepartureStation();
            String arrivalStation = schedule.getArrivalStationNameSnapshot() != null ? 
                    schedule.getArrivalStationNameSnapshot() : schedule.getArrivalStation();
            snapshot.put("route", departureStation + " - " + arrivalStation);
            snapshot.put("departureStation", departureStation);
            snapshot.put("arrivalStation", arrivalStation);
            
            // Departure time (Property 20 - Requirement 6.3)
            if (schedule.getDepartureTime() != null) {
                snapshot.put("departureTime", schedule.getDepartureTime().format(
                        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            }
            
            // Departure date (Property 20 - Requirement 6.4)
            if (schedule.getDepartureTime() != null) {
                snapshot.put("departureDate", schedule.getDepartureTime().toLocalDate().toString());
            }
            
            // Additional useful information
            if (schedule.getArrivalTime() != null) {
                snapshot.put("arrivalTime", schedule.getArrivalTime().format(
                        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            }
            if (schedule.getDurationMinutes() != null) {
                snapshot.put("durationMinutes", schedule.getDurationMinutes());
            }
            
            return objectMapper.writeValueAsString(snapshot);
            
        } catch (Exception e) {
            log.error("Failed to create schedule snapshot JSON: {}", e.getMessage());
            throw new ValidationException("Failed to create schedule snapshot: " + e.getMessage());
        }
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
        
        // Map new fields
        response.setPassengerDetails(order.getPassengerDetails());
        response.setConfirmationCode(order.getConfirmationCode());
        response.setConfirmedAt(order.getConfirmedAt());
        
        return response;
    }
}
