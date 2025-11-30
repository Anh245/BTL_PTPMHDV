# Design Document - Booking Management System

## Overview

Booking Management System là một hệ thống quản lý đặt vé tàu, sử dụng Order Service có sẵn để quản lý đơn đặt vé. Hệ thống tách biệt rõ ràng giữa Ticket (inventory - vé có sẵn trong Tickets Service) và Order (đơn đặt vé của khách hàng trong Orders Service). Hệ thống cho phép khách hàng đặt nhiều vé trong một đơn, tự động giữ chỗ, quản lý trạng thái thanh toán, và hỗ trợ hủy đơn với hoàn tiền.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│  Frontend       │
│  (React)        │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│  API Gateway    │
└────────┬────────┘
         │
         ├──────────────────┬──────────────────┐
         ▼                  ▼                  ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Tickets Service  │  │ Orders Service   │  │ Payment Service  │
│  ┌────────────┐  │  │  ┌────────────┐  │  │  ┌────────────┐  │
│  │   Ticket   │  │  │  │   Order    │  │  │  │Transaction │  │
│  │   Entity   │  │  │  │   Entity   │  │  │  │   Entity   │  │
│  └────────────┘  │  │  └────────────┘  │  │  └────────────┘  │
│   Database       │  │   Database       │  │   Database       │
└──────────────────┘  └──────────────────┘  └──────────────────┘
         ▲                  │                  ▲
         │                  │                  │
         │                  └──────────────────┘
         │                  (Process payment)
         │
         └──────────────────┘
         (Update quantity)
```

### Service Responsibilities

**Orders Service**:
- Quản lý Order entity (đơn đặt vé)
- Lưu trữ thông tin đơn hàng với snapshot data
- Quản lý trạng thái order (created, confirmed, cancelled)
- Quản lý trạng thái payment (pending, paid, failed, refunded)
- Orchestrate booking flow: create order → process payment → confirm order
- Cung cấp API cho order operations

**Tickets Service**:
- Quản lý Ticket entity (inventory)
- Cung cấp thông tin vé và số lượng available
- Cập nhật số lượng vé khi có order mới/hủy
- Expose API để Orders Service có thể update quantity

**Payment Service**:
- Quản lý Transaction entity (giao dịch thanh toán)
- Xử lý thanh toán qua các payment gateways (VNPay, Momo, etc.)
- Lưu trữ request/response logs để đối soát
- Trả về kết quả thanh toán (SUCCESS, FAILED, PENDING)
- Expose API để Orders Service có thể process payment

**Design Decision**: Sử dụng các services có sẵn vì:
1. Đã có sẵn Order entity với đầy đủ fields cần thiết
2. Tách biệt concerns: Orders orchestrate flow, Tickets quản lý inventory, Payment xử lý thanh toán
3. Microservices architecture đúng chuẩn
4. Loose coupling qua REST API calls
5. Payment Service độc lập giúp dễ dàng thay đổi payment gateway

## Components and Interfaces

### 1. Order Entity (Existing in Orders Service)

Order entity đã tồn tại với các fields:

```java
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    // User reference
    @Column(name = "user_ref_id", nullable = false)
    private Integer userRefId;
    
    @Column(name = "user_email_snapshot", length = 100)
    private String userEmailSnapshot;
    
    // Schedule reference
    @Column(name = "schedule_ref_id", nullable = false)
    private Integer scheduleRefId;
    
    @Column(name = "schedule_info_snapshot", columnDefinition = "JSON")
    private String scheduleInfoSnapshot; // JSON snapshot of schedule
    
    // Ticket type reference
    @Column(name = "ticket_type_ref_id")
    private Integer ticketTypeRefId;
    
    @Column(name = "ticket_type_name_snapshot", length = 50)
    private String ticketTypeNameSnapshot;
    
    private Integer quantity;
    
    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "order_status")
    private OrderStatus orderStatus;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    // Enums
    public enum PaymentMethod {
        cash, credit_card, ewallet
    }
    
    public enum PaymentStatus {
        pending, paid, failed, refunded
    }
    
    public enum OrderStatus {
        created, confirmed, cancelled
    }
}
```

**Enhancements Needed**:
1. Add `passenger_details` field (JSON) to store passenger information
2. Add `confirmation_code` field for confirmed orders
3. Add `confirmed_at` timestamp field

### 2. DTOs

**OrderRequest** (Enhanced):
```java
public class OrderRequest {
    // User info
    private Integer userRefId;
    private String userEmailSnapshot;
    
    // Schedule info
    private Integer scheduleRefId;
    private String scheduleInfoSnapshot; // JSON string
    
    // Ticket info
    private Integer ticketTypeRefId;
    private String ticketTypeNameSnapshot;
    private Integer quantity;
    private BigDecimal totalAmount;
    
    // Payment
    private String paymentMethod; // cash, credit_card, ewallet
    
    // NEW: Passenger details
    private String passengerDetails; // JSON array of passenger info
}
```

**OrderResponse** (Enhanced):
```java
public class OrderResponse {
    private Integer id;
    private Integer userRefId;
    private String userEmailSnapshot;
    private Integer scheduleRefId;
    private String scheduleInfoSnapshot;
    private Integer ticketTypeRefId;
    private String ticketTypeNameSnapshot;
    private Integer quantity;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String paymentStatus; // pending, paid, failed, refunded
    private String orderStatus; // created, confirmed, cancelled
    private LocalDateTime createdAt;
    
    // NEW fields
    private String passengerDetails; // JSON array
    private String confirmationCode;
    private LocalDateTime confirmedAt;
}
```

**PassengerInfo** (for JSON serialization):
```java
public class PassengerInfo {
    private String fullName;
    private String idNumber;
    private String phoneNumber;
    private String email;
}
```

### 3. Repository Layer

**OrderRepository** (Enhanced):
```java
public interface OrderRepository extends JpaRepository<Order, Integer> {
    // Existing methods
    List<Order> findByUserRefIdOrderByCreatedAtDesc(Integer userRefId);
    Optional<Order> findByIdAndUserRefId(Integer id, Integer userRefId);
    List<Order> findByTicketTypeRefId(Integer ticketTypeRefId);
    List<Order> findByScheduleRefId(Integer scheduleRefId);
    
    // NEW: Find by confirmation code
    Optional<Order> findByConfirmationCode(String confirmationCode);
}
```

### 4. Service Layer

**OrderService Interface** (Enhanced):
```java
public interface OrderService {
    // Existing methods
    OrderResponse createOrder(OrderRequest request);
    List<OrderResponse> getAllOrders();
    OrderResponse getOrderById(Integer id);
    void deleteOrder(Integer id);
    OrderResponse confirmPayment(Integer id);
    
    // NEW methods
    List<OrderResponse> getUserOrders(Integer userRefId);
    OrderResponse cancelOrder(Integer id, Integer userRefId);
}
```

**OrderServiceImpl** (Enhanced):
- Implements business logic for order operations
- **Calls Tickets Service** to update ticket quantity when order is created/cancelled
- Handles snapshot data from Schedule service
- Generates confirmation codes when order is confirmed
- Validates order constraints (quantity, status, ownership)
- Manages state transitions (created → confirmed → cancelled)

**TicketsServiceClient** (NEW):
```java
@Component
public class TicketsServiceClient {
    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${tickets.service.url}")
    private String ticketsServiceUrl;
    
    public void decreaseTicketQuantity(Integer ticketId, Integer quantity) {
        // PUT /api/tickets/{ticketId}/decrease-quantity?quantity={quantity}
        restTemplate.put(
            ticketsServiceUrl + "/api/tickets/" + ticketId + "/decrease-quantity",
            null,
            Map.of("quantity", quantity)
        );
    }
    
    public void increaseTicketQuantity(Integer ticketId, Integer quantity) {
        // PUT /api/tickets/{ticketId}/increase-quantity?quantity={quantity}
        restTemplate.put(
            ticketsServiceUrl + "/api/tickets/" + ticketId + "/increase-quantity",
            null,
            Map.of("quantity", quantity)
        );
    }
    
    public TicketResponse getTicket(Integer ticketId) {
        // GET /api/tickets/{ticketId}
        return restTemplate.getForObject(
            ticketsServiceUrl + "/api/tickets/" + ticketId,
            TicketResponse.class
        );
    }
}
```

**PaymentServiceClient** (NEW):
```java
@Component
public class PaymentServiceClient {
    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${payment.service.url}")
    private String paymentServiceUrl;
    
    public PaymentResponse processPayment(PaymentRequest request) {
        // POST /api/payments/process
        return restTemplate.postForObject(
            paymentServiceUrl + "/api/payments/process",
            request,
            PaymentResponse.class
        );
    }
}
```

### 5. Controller Layer

**OrderController** (Enhanced):
```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    
    // Existing endpoints
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
        @RequestBody OrderRequest request,
        @AuthenticationPrincipal JwtUserPrincipal principal
    );
    
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders();
    
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Integer id);
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Integer id);
    
    @PutMapping("/{id}/confirm-payment")
    public ResponseEntity<OrderResponse> confirmPayment(@PathVariable Integer id);
    
    // NEW endpoints
    @GetMapping("/user/{userRefId}")
    public ResponseEntity<List<OrderResponse>> getUserOrders(
        @PathVariable Integer userRefId,
        @AuthenticationPrincipal JwtUserPrincipal principal
    );
    
    @PutMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
        @PathVariable Integer id,
        @AuthenticationPrincipal JwtUserPrincipal principal
    );
}
```

### 6. Tickets Service Enhancements

**TicketController** (NEW endpoints):
```java
@RestController
@RequestMapping("/api/tickets")
public class TicketController {
    
    // Existing endpoints...
    
    // NEW: Decrease quantity (called by Orders Service)
    @PutMapping("/{id}/decrease-quantity")
    public ResponseEntity<Void> decreaseQuantity(
        @PathVariable Long id,
        @RequestParam Integer quantity
    );
    
    // NEW: Increase quantity (called by Orders Service when order cancelled)
    @PutMapping("/{id}/increase-quantity")
    public ResponseEntity<Void> increaseQuantity(
        @PathVariable Long id,
        @RequestParam Integer quantity
    );
}
```

**TicketService** (NEW methods):
```java
public interface TicketService {
    // Existing methods...
    
    void decreaseQuantity(Long ticketId, Integer quantity);
    void increaseQuantity(Long ticketId, Integer quantity);
}
```

## Data Models

### Entity Relationship

```
┌──────────────────┐         ┌──────────────────┐
│ Tickets Service  │         │ Orders Service   │
│                  │         │                  │
│  ┌────────────┐  │         │  ┌────────────┐  │
│  │   Ticket   │  │         │  │   Order    │  │
│  │            │  │◄────────│  │            │  │
│  │ - id       │  │  ref    │  │ - id       │  │
│  │ - total_qty│  │         │  │ - ticket_id│  │
│  │ - sold_qty │  │         │  │ - user_id  │  │
│  └────────────┘  │         │  │ - quantity │  │
│                  │         │  │ - status   │  │
└──────────────────┘         │  └────────────┘  │
                             │                  │
                             └──────────────────┘
```

### Database Schema Changes

**orders table** (ALTER TABLE to add new columns):
```sql
ALTER TABLE orders
ADD COLUMN passenger_details TEXT COMMENT 'JSON array of passenger information',
ADD COLUMN confirmation_code VARCHAR(50) UNIQUE COMMENT 'Unique confirmation code for confirmed orders',
ADD COLUMN confirmed_at DATETIME COMMENT 'Timestamp when order was confirmed',
ADD INDEX idx_confirmation_code (confirmation_code);
```

**Existing orders table structure**:
```sql
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_ref_id INT NOT NULL,
    user_email_snapshot VARCHAR(100),
    schedule_ref_id INT NOT NULL,
    schedule_info_snapshot JSON,
    ticket_type_ref_id INT,
    ticket_type_name_snapshot VARCHAR(50),
    quantity INT,
    total_amount DECIMAL(10,2),
    payment_method VARCHAR(20),
    payment_status VARCHAR(20),
    order_status VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- NEW columns
    passenger_details TEXT,
    confirmation_code VARCHAR(50) UNIQUE,
    confirmed_at DATETIME,
    
    INDEX idx_user_ref_id (user_ref_id),
    INDEX idx_schedule_ref_id (schedule_ref_id),
    INDEX idx_confirmation_code (confirmation_code)
);
```

## Correctn
ess Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

After reviewing the prework analysis, I've identified several redundant properties that can be consolidated:
- Properties 6.1-6.4 all test snapshot data copying and can be combined into one comprehensive property
- Property 2.3 and 4.4 test the same round-trip behavior (create/cancel restores quantity)
- Property 3.2 and 3.4 both test that booking details include all required fields
- API endpoint tests (7.1-7.5) are integration examples, not universal properties

**Property 1: Order creation stores all required data**
*For any* valid order request with user ID, ticket ID, schedule ID, quantity, and passenger details, creating an order should result in an order entity that contains all these fields with the exact values provided.
**Validates: Requirements 1.1, 1.4**

**Property 2: Quantity validation prevents overbooking**
*For any* order request, if the requested quantity exceeds the available ticket quantity, the system should reject the order request with a validation error.
**Validates: Requirements 1.2**

**Property 3: Total price calculation correctness**
*For any* ticket with price P and order quantity Q, the total amount of the order should equal P × Q.
**Validates: Requirements 1.3**

**Property 4: Order creation decreases available quantity**
*For any* ticket with available quantity A, creating an order with quantity Q should result in the ticket having available quantity A - Q (Orders Service calls Tickets Service to decrease quantity).
**Validates: Requirements 2.1**

**Property 5: Order confirmation maintains quantity**
*For any* order in created status, confirming the order should not change the ticket's available quantity.
**Validates: Requirements 2.2**

**Property 6: Order cancellation round-trip restores quantity**
*For any* ticket with available quantity A, creating an order with quantity Q and then cancelling it should restore the available quantity to A (Orders Service calls Tickets Service to increase quantity).
**Validates: Requirements 2.3, 4.4**

**Property 7: Sold quantity never exceeds total quantity**
*For any* sequence of booking operations (create, cancel, confirm), the ticket's sold quantity should never exceed its total quantity.
**Validates: Requirements 2.4**

**Property 8: Available quantity calculation**
*For any* ticket with total quantity T and sold quantity S, the available quantity should equal T - S.
**Validates: Requirements 2.5**

**Property 9: User order filtering**
*For any* user ID, retrieving orders for that user should return only orders where the order's user ID matches the requested user ID.
**Validates: Requirements 3.1**

**Property 10: Order response completeness**
*For any* order, the order response should include all required fields: order ID, user ID, ticket ID, schedule ID, quantity, total amount, passenger details, snapshot data, order status, and payment status.
**Validates: Requirements 3.2, 3.4, 3.5**

**Property 11: Order list sort order**
*For any* list of orders for a user, the orders should be sorted by creation date in descending order (newest first).
**Validates: Requirements 3.3**

**Property 12: Order ownership verification for cancellation**
*For any* cancellation request, if the order's user ID does not match the requesting user ID, the system should reject the cancellation with an authorization error.
**Validates: Requirements 4.1**

**Property 13: Cancellation status validation**
*For any* order, cancellation should only succeed if the order status is created or confirmed; attempting to cancel an order in any other status should fail with a validation error.
**Validates: Requirements 4.2**

**Property 14: Cancellation updates status**
*For any* cancellable order (status created or confirmed), cancelling the order should update the order status to cancelled.
**Validates: Requirements 4.3**

**Property 15: Cancellation refund for paid orders**
*For any* order with payment status paid, cancelling the order should update the payment status to refunded.
**Validates: Requirements 4.5**

**Property 16: Payment success updates payment status**
*For any* order with payment status pending, processing a successful payment should update the payment status to paid.
**Validates: Requirements 5.1**

**Property 17: Payment triggers confirmation**
*For any* order, when payment status changes to paid, the order status should be updated to confirmed.
**Validates: Requirements 5.2**

**Property 18: Confirmation generates code and timestamp**
*For any* order that is confirmed, the order should have a non-null confirmation code and a non-null confirmation timestamp.
**Validates: Requirements 5.3, 5.4**

**Property 19: Confirmation requires created status**
*For any* order, confirmation should only succeed if the order status is created; attempting to confirm an order in any other status should fail with a validation error.
**Validates: Requirements 5.5**

**Property 20: Snapshot data completeness**
*For any* order created from a schedule, the order should contain snapshot data (schedule_info_snapshot JSON) with train number, route, departure time, and departure date from the schedule.
**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

## Error Handling

### Validation Errors

1. **Insufficient Tickets**: When requested quantity exceeds available tickets
   - HTTP 400 Bad Request
   - Error message: "Insufficient tickets available. Requested: {quantity}, Available: {available}"

2. **Invalid Order Status**: When attempting operations on orders in wrong status
   - HTTP 400 Bad Request
   - Error message: "Cannot {operation} order in {current_status} status"

3. **Unauthorized Access**: When user attempts to access/modify another user's order
   - HTTP 403 Forbidden
   - Error message: "You are not authorized to access this order"

4. **Order Not Found**: When order ID doesn't exist
   - HTTP 404 Not Found
   - Error message: "Order not found with ID: {id}"

5. **Ticket Not Found**: When referenced ticket doesn't exist (from Tickets Service)
   - HTTP 404 Not Found
   - Error message: "Ticket not found with ID: {ticketId}"

### Business Logic Errors

1. **Quantity Constraint Violation**: When sold quantity would exceed total quantity (in Tickets Service)
   - Rollback transaction
   - Return validation error to Orders Service
   - Log error for investigation

2. **Concurrent Order Conflict**: When multiple users order the last tickets simultaneously
   - Use optimistic locking on Ticket entity (in Tickets Service)
   - Retry logic with exponential backoff in Orders Service
   - Return "Tickets no longer available" if all retries fail

3. **Tickets Service Unavailable**: When Orders Service cannot call Tickets Service
   - HTTP 503 Service Unavailable
   - Error message: "Tickets service temporarily unavailable"
   - Implement circuit breaker pattern (Resilience4j)
   - Rollback order creation if ticket quantity update fails

4. **Schedule Service Unavailable**: When cannot fetch schedule data for snapshot
   - HTTP 503 Service Unavailable
   - Error message: "Schedule service temporarily unavailable"
   - Implement circuit breaker pattern

### Error Response Format

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Insufficient tickets available. Requested: 5, Available: 2",
  "path": "/api/orders"
}
```

## Testing Strategy

### Unit Testing

**Framework**: JUnit 5 + Mockito

**Test Coverage**:

**Orders Service Tests**:
1. **Service Layer Tests**:
   - Test order creation with valid data
   - Test validation logic (quantity, status, ownership)
   - Test status transitions
   - Test snapshot data copying
   - Mock repository and TicketsServiceClient calls
   - Test error handling when Tickets Service is unavailable

2. **Repository Tests**:
   - Test custom query methods
   - Test filtering by user ID
   - Test sorting by creation date
   - Use @DataJpaTest for in-memory database

3. **Controller Tests**:
   - Test request/response mapping
   - Test authentication/authorization
   - Test error responses
   - Use @WebMvcTest with mocked service

**Tickets Service Tests**:
1. **Service Layer Tests**:
   - Test decrease quantity logic
   - Test increase quantity logic
   - Test quantity constraint validation
   - Test optimistic locking behavior

2. **Controller Tests**:
   - Test quantity update endpoints
   - Test authorization for quantity updates

### Property-Based Testing

**Framework**: jqwik (Java property-based testing library)

**Configuration**: Each property test should run minimum 100 iterations

**Test Tagging**: Each property-based test must include a comment with format:
```java
// Feature: booking-management, Property {number}: {property_text}
```

**Property Tests**:
1. Test order creation with random valid inputs (Property 1)
2. Test quantity validation with random quantities (Property 2, 7)
3. Test price calculation with random prices and quantities (Property 3)
4. Test quantity updates with random order operations (Property 4, 5, 6, 8)
5. Test filtering with random user IDs and orders (Property 9)
6. Test response completeness with random orders (Property 10)
7. Test sort order with random creation dates (Property 11)
8. Test authorization with random user/order combinations (Property 12)
9. Test status validation with random statuses (Property 13, 19)
10. Test state transitions with random order states (Property 14, 15, 16, 17, 18)
11. Test snapshot data with random schedule data (Property 20)

### Integration Testing

**Framework**: Spring Boot Test + TestContainers

**Test Scenarios**:
1. End-to-end order creation flow (Orders Service → Tickets Service)
2. End-to-end cancellation flow (Orders Service → Tickets Service)
3. End-to-end confirmation flow
4. Concurrent order scenarios
5. Database transaction rollback scenarios
6. Service communication failure scenarios (Tickets Service down)

### Test Data Generators

For property-based testing, implement generators for:
- Random order requests with valid/invalid data
- Random ticket states (various quantities)
- Random user IDs
- Random order statuses
- Random payment statuses
- Random passenger information
- Random schedule data for snapshots

## Implementation Notes

### Confirmation Code Generation

Use UUID-based confirmation codes:
```java
String confirmationCode = "BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
// Example: BK-A1B2C3D4
```

### Passenger Details JSON Format

```json
[
  {
    "fullName": "Nguyen Van A",
    "idNumber": "123456789",
    "phoneNumber": "0901234567",
    "email": "nguyenvana@example.com"
  }
]
```

Store as TEXT column, serialize/deserialize using Jackson ObjectMapper.

### Transaction Management

All order operations must be transactional with compensation logic:

**Create Order Flow**:
```java
@Transactional
public OrderResponse createOrder(OrderRequest request) {
    try {
        // 1. Validate ticket availability (call Tickets Service)
        TicketResponse ticket = ticketsClient.getTicket(request.getTicketTypeRefId());
        if (ticket.getAvailableQuantity() < request.getQuantity()) {
            throw new InsufficientTicketsException();
        }
        
        // 2. Create order in database with status 'created' and payment 'pending'
        Order order = orderRepository.save(newOrder);
        
        // 3. Decrease ticket quantity (call Tickets Service)
        ticketsClient.decreaseTicketQuantity(request.getTicketTypeRefId(), request.getQuantity());
        
        return toResponse(order);
    } catch (Exception e) {
        // Rollback: If step 3 fails, delete the order
        // Transaction will auto-rollback database changes
        throw e;
    }
}
```

**Confirm Payment Flow** (NEW):
```java
@Transactional
public OrderResponse confirmPayment(Integer orderId, String paymentMethod) {
    try {
        // 1. Get order
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new NotFoundException("Order not found"));
        
        // 2. Validate order status is 'created'
        if (!order.getOrderStatus().equals(OrderStatus.created)) {
            throw new InvalidStatusException("Cannot confirm payment for order in " + order.getOrderStatus() + " status");
        }
        
        // 3. Process payment (call Payment Service)
        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setOrderId(orderId);
        paymentRequest.setAmount(order.getTotalAmount());
        paymentRequest.setPaymentMethod(paymentMethod);
        
        PaymentResponse paymentResponse = paymentClient.processPayment(paymentRequest);
        
        // 4. Update order based on payment result
        if (paymentResponse.getStatus().equals("SUCCESS")) {
            order.setPaymentStatus(PaymentStatus.paid);
            order.setOrderStatus(OrderStatus.confirmed);
            order.setConfirmationCode(generateConfirmationCode());
            order.setConfirmedAt(LocalDateTime.now());
        } else {
            order.setPaymentStatus(PaymentStatus.failed);
            // Restore ticket quantity if payment failed
            ticketsClient.increaseTicketQuantity(order.getTicketTypeRefId(), order.getQuantity());
        }
        
        orderRepository.save(order);
        return toResponse(order);
        
    } catch (Exception e) {
        // Log error and rethrow
        throw e;
    }
}
```

### Optimistic Locking

Add version field to Ticket entity (in Tickets Service) to handle concurrent orders:
```java
@Version
private Long version;
```

### Schedule Service Integration

Fetch schedule data when creating order:
```java
// Call Schedule Service REST API
ScheduleResponse schedule = scheduleClient.getScheduleById(scheduleRefId);

// Create JSON snapshot
String scheduleSnapshot = objectMapper.writeValueAsString(Map.of(
    "trainNumber", schedule.getTrainNumber(),
    "route", schedule.getRoute(),
    "departureTime", schedule.getDepartureTime(),
    "departureDate", schedule.getDepartureDate()
));

order.setScheduleInfoSnapshot(scheduleSnapshot);
```

If Schedule Service is unavailable, fail the order creation with 503 error.

### Circuit Breaker Pattern

Use Resilience4j for service-to-service calls:
```java
@CircuitBreaker(name = "ticketsService", fallbackMethod = "ticketsServiceFallback")
public void decreaseTicketQuantity(Integer ticketId, Integer quantity) {
    ticketsClient.decreaseTicketQuantity(ticketId, quantity);
}

private void ticketsServiceFallback(Integer ticketId, Integer quantity, Exception e) {
    throw new ServiceUnavailableException("Tickets service is temporarily unavailable");
}
```

## Security Considerations

1. **Authentication**: All order endpoints require JWT authentication
2. **Authorization**: Users can only access their own orders
3. **Input Validation**: Validate all input data (quantity > 0, valid IDs, etc.)
4. **SQL Injection Prevention**: Use JPA parameterized queries
5. **Rate Limiting**: Implement rate limiting on order creation to prevent abuse
6. **Service-to-Service Auth**: Tickets Service endpoints for quantity updates should validate requests from Orders Service (API key or service token)

## Performance Considerations

1. **Database Indexes**: Index on user_ref_id, ticket_type_ref_id, schedule_ref_id, created_at, confirmation_code
2. **Pagination**: Implement pagination for order list endpoint
3. **Caching**: Cache ticket availability data with short TTL (30 seconds)
4. **Connection Pooling**: Configure HikariCP for optimal database connections
5. **Async Processing**: Consider async processing for confirmation emails/notifications
6. **Service Communication**: Use connection pooling for RestTemplate calls between services
7. **Timeout Configuration**: Set appropriate timeouts for service-to-service calls (e.g., 5 seconds)

## Future Enhancements

1. **Order Expiration**: Auto-cancel orders not paid within 15 minutes (scheduled job)
2. **Seat Selection**: Allow users to select specific seats
3. **Group Booking**: Support ordering multiple tickets across different schedules
4. **Order Modification**: Allow users to modify order details before confirmation
5. **Notification Service**: Send email/SMS notifications for order events
6. **Payment Integration**: Integrate with payment gateways (VNPay, Momo, etc.)
7. **Saga Pattern**: Implement distributed transaction pattern for better reliability
8. **Event-Driven Architecture**: Use message queue (RabbitMQ/Kafka) for async communication between services
