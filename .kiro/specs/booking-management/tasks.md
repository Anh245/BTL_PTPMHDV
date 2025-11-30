  # Implementation Plan

- [x] 1. Enhance Order Entity with new fields





  - Add `passengerDetails` field (TEXT column) to store JSON array of passenger information
  - Add `confirmationCode` field (VARCHAR(50), UNIQUE) for confirmed orders
  - Add `confirmedAt` field (DATETIME) to record confirmation timestamp
  - Create database migration script (ALTER TABLE)
  - _Requirements: 1.4, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4_

- [x] 2. Create Tickets Service Client in Orders Service




- [x] 2.1 Implement TicketsServiceClient component


  - Create RestTemplate bean with connection pooling configuration
  - Implement `getTicket(Integer ticketId)` method
  - Implement `decreaseTicketQuantity(Integer ticketId, Integer quantity)` method
  - Implement `increaseTicketQuantity(Integer ticketId, Integer quantity)` method
  - Add timeout configuration (5 seconds)
  - _Requirements: 2.1, 2.3, 4.4_

- [ ]* 2.2 Write unit tests for TicketsServiceClient
  - Test successful API calls with mocked RestTemplate
  - Test error handling when Tickets Service returns 404
  - Test error handling when Tickets Service is unavailable
  - Test timeout behavior
  - _Requirements: 2.1, 2.3_

- [x] 3. Add quantity management endpoints to Tickets Service




- [x] 3.1 Implement decrease quantity endpoint


  - Add `PUT /api/tickets/{id}/decrease-quantity` endpoint in TicketController
  - Implement `decreaseQuantity(Long ticketId, Integer quantity)` in TicketService
  - Validate quantity > 0
  - Validate available quantity >= requested quantity
  - Update `soldQuantity` atomically
  - Return 400 if insufficient tickets
  - _Requirements: 2.1, 2.4_

- [x] 3.2 Implement increase quantity endpoint


  - Add `PUT /api/tickets/{id}/increase-quantity` endpoint in TicketController
  - Implement `increaseQuantity(Long ticketId, Integer quantity)` in TicketService
  - Validate quantity > 0
  - Decrease `soldQuantity` atomically
  - Ensure soldQuantity doesn't go negative
  - _Requirements: 2.3, 4.4_

- [ ]* 3.3 Write property test for quantity constraints
  - **Property 7: Sold quantity never exceeds total quantity**
  - **Validates: Requirements 2.4**
  - Generate random sequences of increase/decrease operations
  - Verify soldQuantity <= totalQuantity always holds
  - Run 100 iterations

- [ ]* 3.4 Write unit tests for quantity endpoints
  - Test decrease quantity with valid request
  - Test decrease quantity with insufficient tickets
  - Test increase quantity with valid request
  - Test concurrent quantity updates with optimistic locking
  - _Requirements: 2.1, 2.3, 2.4_
-

- [x] 4. Enhance OrderService with booking logic




- [x] 4.1 Update createOrder method


  - Call TicketsServiceClient to get ticket information
  - Validate requested quantity against available quantity (Property 2)
  - Calculate total amount (ticket price × quantity) (Property 3)
  - Parse and validate passenger details JSON
  - Call TicketsServiceClient to decrease quantity (Property 4)
  - Implement compensation logic (rollback if decrease fails)
  - Set initial order status to 'created' and payment status to 'pending'
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1_

- [ ]* 4.2 Write property test for order creation
  - **Property 1: Order creation stores all required data**
  - **Validates: Requirements 1.1, 1.4**
  - Generate random valid order requests
  - Create orders and verify all fields are stored correctly
  - Run 100 iterations

- [ ]* 4.3 Write property test for quantity validation
  - **Property 2: Quantity validation prevents overbooking**
  - **Validates: Requirements 1.2**
  - Generate random quantities (valid and invalid)
  - Verify orders with quantity > available are rejected
  - Run 100 iterations

- [ ]* 4.4 Write property test for price calculation
  - **Property 3: Total price calculation correctness**
  - **Validates: Requirements 1.3**
  - Generate random ticket prices and quantities
  - Verify totalAmount = price × quantity
  - Run 100 iterations

- [ ]* 4.5 Write property test for quantity decrease
  - **Property 4: Order creation decreases available quantity**
  - **Validates: Requirements 2.1**
  - Generate random orders
  - Verify ticket available quantity decreases by order quantity
  - Run 100 iterations

- [x] 5. Implement order cancellation logic




- [x] 5.1 Add cancelOrder method to OrderService


  - Verify order belongs to requesting user (Property 12)
  - Validate order status is 'created' or 'confirmed' (Property 13)
  - Update order status to 'cancelled' (Property 14)
  - If payment status is 'paid', update to 'refunded' (Property 15)
  - Call TicketsServiceClient to increase quantity (Property 6)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 5.2 Write property test for cancellation round-trip
  - **Property 6: Order cancellation round-trip restores quantity**
  - **Validates: Requirements 2.3, 4.4**
  - Generate random orders
  - Create order then cancel it
  - Verify ticket quantity is restored to original value
  - Run 100 iterations

- [ ]* 5.3 Write property test for ownership verification
  - **Property 12: Order ownership verification for cancellation**
  - **Validates: Requirements 4.1**
  - Generate random user/order combinations
  - Verify users can only cancel their own orders
  - Run 100 iterations

- [ ]* 5.4 Write property test for cancellation status validation
  - **Property 13: Cancellation status validation**
  - **Validates: Requirements 4.2**
  - Generate orders in various statuses
  - Verify only 'created' or 'confirmed' orders can be cancelled
  - Run 100 iterations

- [ ]* 5.5 Write property test for cancellation status update
  - **Property 14: Cancellation updates status**
  - **Validates: Requirements 4.3**
  - Generate cancellable orders
  - Cancel and verify status becomes 'cancelled'
  - Run 100 iterations

- [ ]* 5.6 Write property test for refund on cancellation
  - **Property 15: Cancellation refund for paid orders**
  - **Validates: Requirements 4.5**
  - Generate orders with 'paid' payment status
  - Cancel and verify payment status becomes 'refunded'
  - Run 100 iterations
-

- [x] 6. Create Payment Service Client in Orders Service



- [x] 6.1 Implement PaymentServiceClient component


  - Create PaymentServiceClient with RestTemplate
  - Implement `processPayment(PaymentRequest request)` method
  - Add timeout configuration (10 seconds for payment processing)
  - Add error handling for payment service unavailable
  - _Requirements: 5.1_

- [ ]* 6.2 Write unit tests for PaymentServiceClient
  - Test successful payment processing with mocked RestTemplate
  - Test error handling when Payment Service returns FAILED
  - Test error handling when Payment Service is unavailable
  - Test timeout behavior
  - _Requirements: 5.1_

- [x] 7. Implement order confirmation logic with payment




- [x] 7.1 Enhance confirmPayment method


  - Validate order status is 'created' (Property 19)
  - Call PaymentServiceClient to process payment
  - If payment SUCCESS: update payment status to 'paid' (Property 16)
  - If payment SUCCESS: update order status to 'confirmed' (Property 17)
  - If payment SUCCESS: generate unique confirmation code (UUID-based) (Property 18)
  - If payment SUCCESS: set confirmedAt timestamp (Property 18)
  - If payment FAILED: update payment status to 'failed'
  - If payment FAILED: restore ticket quantity (call TicketsServiceClient)
  - Verify quantity is not changed on success (Property 5)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 2.2_

- [ ]* 7.2 Write property test for confirmation maintains quantity
  - **Property 5: Order confirmation maintains quantity**
  - **Validates: Requirements 2.2**
  - Generate orders in 'created' status
  - Confirm orders (mock successful payment) and verify ticket quantity unchanged
  - Run 100 iterations

- [ ]* 7.3 Write property test for payment status update
  - **Property 16: Payment success updates payment status**
  - **Validates: Requirements 5.1**
  - Generate orders with 'pending' payment status
  - Process payment (mock SUCCESS response) and verify status becomes 'paid'
  - Run 100 iterations

- [ ]* 7.4 Write property test for payment triggers confirmation
  - **Property 17: Payment triggers confirmation**
  - **Validates: Requirements 5.2**
  - Generate orders
  - Process payment (mock SUCCESS response) and verify order status becomes 'confirmed'
  - Run 100 iterations

- [ ]* 7.5 Write property test for confirmation code generation
  - **Property 18: Confirmation generates code and timestamp**
  - **Validates: Requirements 5.3, 5.4**
  - Generate random orders
  - Confirm (mock successful payment) and verify confirmationCode and confirmedAt are not null
  - Run 100 iterations

- [ ]* 7.6 Write property test for confirmation status validation
  - **Property 19: Confirmation requires created status**
  - **Validates: Requirements 5.5**
  - Generate orders in various statuses
  - Verify only 'created' orders can be confirmed
  - Run 100 iterations

- [ ]* 7.7 Write unit test for payment failure handling
  - Create order
  - Mock payment service to return FAILED
  - Confirm payment
  - Verify payment status is 'failed'
  - Verify ticket quantity is restored
  - _Requirements: 5.1, 2.3_
-

- [x] 8. Add user-specific order endpoints




- [x] 8.1 Implement getUserOrders endpoint


  - Add `GET /api/orders/user/{userRefId}` endpoint in OrderController
  - Implement `getUserOrders(Integer userRefId)` in OrderService
  - Filter orders by userRefId (Property 9)
  - Sort by createdAt DESC (Property 11)
  - Verify requesting user matches userRefId (authorization)
  - _Requirements: 3.1, 3.3_

- [x] 8.2 Implement cancelOrder endpoint


  - Add `PUT /api/orders/{id}/cancel` endpoint in OrderController
  - Extract userId from JWT token
  - Call OrderService.cancelOrder(id, userId)
  - Return updated order response
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 8.3 Write property test for user filtering
  - **Property 9: User order filtering**
  - **Validates: Requirements 3.1**
  - Generate random users with random orders
  - Retrieve orders for each user
  - Verify only orders belonging to that user are returned
  - Run 100 iterations

- [ ]* 8.4 Write property test for sort order
  - **Property 11: Order list sort order**
  - **Validates: Requirements 3.3**
  - Generate orders with random creation dates
  - Retrieve order list
  - Verify orders are sorted by createdAt DESC
  - Run 100 iterations

- [x] 9. Enhance DTOs with new fields




- [x] 9.1 Update OrderRequest DTO


  - Add `passengerDetails` field (String - JSON)
  - Add validation annotations (@NotNull, @NotEmpty)
  - Create PassengerInfo class for JSON structure
  - _Requirements: 1.4_

- [x] 9.2 Update OrderResponse DTO


  - Add `passengerDetails` field
  - Add `confirmationCode` field
  - Add `confirmedAt` field
  - Ensure all required fields are included (Property 10)
  - _Requirements: 3.2, 3.4, 3.5, 5.3, 5.4_

- [ ]* 9.3 Write property test for response completeness
  - **Property 10: Order response completeness**
  - **Validates: Requirements 3.2, 3.4, 3.5**
  - Generate random orders
  - Convert to response DTO
  - Verify all required fields are present and non-null
  - Run 100 iterations

- [x] 10. Implement Circuit Breaker for service communication




- [x] 10.1 Add Resilience4j dependency


  - Add resilience4j-spring-boot2 to pom.xml
  - Configure circuit breaker properties in application.properties
  - Set failure rate threshold, wait duration, etc.
  - _Requirements: Error Handling_

- [x] 10.2 Apply Circuit Breaker to service clients


  - Add @CircuitBreaker annotation to TicketsServiceClient methods
  - Add @CircuitBreaker annotation to PaymentServiceClient methods
  - Implement fallback methods for service unavailable scenarios
  - Log circuit breaker state changes
  - Return appropriate error messages to users
  - _Requirements: Error Handling_

- [x] 10.3 (Removed - merged with 10.2)

- [ ]* 10.4 Write unit tests for circuit breaker
  - Test circuit opens after threshold failures
  - Test fallback method is called when circuit is open
  - Test circuit closes after wait duration
  - _Requirements: Error Handling_

- [x] 11. Add snapshot data handling




- [x] 11.1 Implement Schedule Service client


  - Create ScheduleServiceClient component
  - Implement `getSchedule(Integer scheduleId)` method
  - Add error handling for service unavailable
  - _Requirements: 6.1, 6.2, 6.3, 6.4_


- [x] 11.2 Update createOrder to store snapshot data

  - Call ScheduleServiceClient to get schedule details
  - Create JSON snapshot with train number, route, departure time, departure date
  - Store in `scheduleInfoSnapshot` field (Property 20)
  - Handle Schedule Service unavailable error (503)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 11.3 Write property test for snapshot data
  - **Property 20: Snapshot data completeness**
  - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**
  - Generate random schedule data
  - Create orders
  - Verify scheduleInfoSnapshot contains all required fields
  - Run 100 iterations

- [x] 12. Checkpoint - Ensure all tests pass





  - Run all unit tests and property tests
  - Verify all endpoints work correctly
  - Test service-to-service communication
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 13. Integration testing
- [ ]* 13.1 Write end-to-end order creation test
  - Start both Orders Service and Tickets Service (TestContainers)
  - Create order through REST API
  - Verify order is created in database
  - Verify ticket quantity is decreased
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1_

- [ ]* 13.2 Write end-to-end cancellation test
  - Create order
  - Cancel order through REST API
  - Verify order status is 'cancelled'
  - Verify ticket quantity is restored
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ]* 13.3 Write end-to-end confirmation test
  - Start Orders Service, Tickets Service, and Payment Service (TestContainers)
  - Create order through REST API
  - Confirm payment through REST API
  - Verify order status is 'confirmed'
  - Verify payment transaction is recorded in Payment Service
  - Verify confirmation code is generated
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ]* 13.4 Write end-to-end payment failure test
  - Start all services
  - Create order
  - Mock Payment Service to return FAILED
  - Confirm payment
  - Verify order payment status is 'failed'
  - Verify ticket quantity is restored
  - _Requirements: 5.1, 2.3_

- [ ]* 13.5 (Removed - renumbered)
  - Create order
  - Confirm payment through REST API
  - Verify order status is 'confirmed'
  - Verify confirmation code is generated
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ]* 13.6 Write concurrent order test
  - Simulate multiple users ordering last tickets simultaneously
  - Verify only one order succeeds
  - Verify others get "insufficient tickets" error
  - Test optimistic locking behavior
  - _Requirements: 2.4_

- [ ]* 13.7 Write service unavailable test
  - Stop Tickets Service
  - Attempt to create order
  - Verify circuit breaker opens
  - Verify appropriate error message returned
  - _Requirements: Error Handling_

- [ ] 14. Final Checkpoint - Ensure all tests pass










  - Run complete test suite (unit + property + integration)
  - Verify all correctness properties are validated
  - Test all API endpoints manually
  - Ensure all tests pass, ask the user if questions arise.
