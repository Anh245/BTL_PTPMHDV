# Requirements Document

## Introduction

Hệ thống quản lý đặt vé (Booking Management System) cho phép khách hàng đặt vé tàu trực tuyến. Hệ thống cần tách biệt rõ ràng giữa Ticket (vé có sẵn để bán) và Booking (đơn đặt vé của khách hàng). Một Booking có thể chứa nhiều vé cho cùng một chuyến tàu, và cần quản lý trạng thái thanh toán, xác nhận, và hủy đơn.

## Glossary

- **Booking System**: Hệ thống quản lý đặt vé
- **Ticket Entity**: Thực thể đại diện cho vé có sẵn để bán (inventory)
- **Booking Entity**: Thực thể đại diện cho đơn đặt vé của khách hàng
- **Schedule**: Lịch trình chuyến tàu
- **User**: Người dùng/khách hàng đặt vé
- **Payment Status**: Trạng thái thanh toán (PENDING, PAID, FAILED, REFUNDED)
- **Booking Status**: Trạng thái đơn đặt vé (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- **Available Quantity**: Số lượng vé còn lại có thể đặt

## Requirements

### Requirement 1

**User Story:** Là một khách hàng, tôi muốn đặt nhiều vé cho cùng một chuyến tàu trong một đơn hàng, để tôi có thể đi cùng gia đình hoặc bạn bè.

#### Acceptance Criteria

1. WHEN a user creates a booking THEN the Booking System SHALL create a Booking entity with user information, schedule reference, and requested quantity
2. WHEN a user specifies quantity THEN the Booking System SHALL validate that the requested quantity does not exceed available tickets
3. WHEN a booking is created THEN the Booking System SHALL calculate total price by multiplying ticket price with quantity
4. WHEN a booking is created THEN the Booking System SHALL store passenger details for each ticket in the booking
5. WHEN a booking is created THEN the Booking System SHALL set initial status to PENDING and payment status to PENDING

### Requirement 2

**User Story:** Là một khách hàng, tôi muốn hệ thống tự động giữ chỗ khi tôi đặt vé, để đảm bảo vé không bị người khác đặt trong khi tôi thanh toán.

#### Acceptance Criteria

1. WHEN a booking is created THEN the Booking System SHALL decrease the available quantity in the Ticket entity by the booking quantity
2. WHEN a booking is confirmed THEN the Booking System SHALL maintain the reserved quantity
3. WHEN a booking is cancelled THEN the Booking System SHALL increase the available quantity in the Ticket entity by the booking quantity
4. WHEN updating ticket quantity THEN the Booking System SHALL ensure the sold quantity never exceeds total quantity
5. WHEN checking available tickets THEN the Booking System SHALL return the difference between total quantity and sold quantity

### Requirement 3

**User Story:** Là một khách hàng, tôi muốn xem lịch sử các đơn đặt vé của mình, để tôi có thể theo dõi và quản lý các chuyến đi.

#### Acceptance Criteria

1. WHEN a user requests booking history THEN the Booking System SHALL return all bookings associated with that user ID
2. WHEN displaying booking details THEN the Booking System SHALL include booking ID, schedule information, passenger details, quantity, total price, and status
3. WHEN displaying booking list THEN the Booking System SHALL sort bookings by creation date in descending order
4. WHEN a user views a specific booking THEN the Booking System SHALL display complete booking information including all passenger details
5. WHEN retrieving bookings THEN the Booking System SHALL include snapshot data from schedule to display route and departure information

### Requirement 4

**User Story:** Là một khách hàng, tôi muốn hủy đơn đặt vé trước giờ khởi hành, để tôi có thể nhận lại tiền khi có thay đổi kế hoạch.

#### Acceptance Criteria

1. WHEN a user cancels a booking THEN the Booking System SHALL verify the booking belongs to that user
2. WHEN a user cancels a booking THEN the Booking System SHALL check that the booking status is PENDING or CONFIRMED
3. WHEN a booking is cancelled THEN the Booking System SHALL update booking status to CANCELLED
4. WHEN a booking is cancelled THEN the Booking System SHALL restore the ticket quantity by increasing available quantity
5. WHEN a booking is cancelled and payment was completed THEN the Booking System SHALL update payment status to REFUNDED

### Requirement 5

**User Story:** Là một admin, tôi muốn xác nhận đơn đặt vé sau khi thanh toán thành công, để khách hàng có thể sử dụng vé.

#### Acceptance Criteria

1. WHEN payment is successful THEN the Booking System SHALL update payment status to PAID
2. WHEN payment status is PAID THEN the Booking System SHALL update booking status to CONFIRMED
3. WHEN a booking is confirmed THEN the Booking System SHALL generate a booking confirmation code
4. WHEN a booking is confirmed THEN the Booking System SHALL record the confirmation timestamp
5. WHEN confirming a booking THEN the Booking System SHALL validate that the booking exists and is in PENDING status

### Requirement 6

**User Story:** Là một developer, tôi muốn Booking entity lưu trữ snapshot data từ Schedule, để thông tin đặt vé không bị ảnh hưởng khi Schedule thay đổi.

#### Acceptance Criteria

1. WHEN a booking is created THEN the Booking System SHALL copy train number from the referenced schedule
2. WHEN a booking is created THEN the Booking System SHALL copy route information from the referenced schedule
3. WHEN a booking is created THEN the Booking System SHALL copy departure time from the referenced schedule
4. WHEN a booking is created THEN the Booking System SHALL copy departure date from the referenced schedule
5. WHEN displaying booking information THEN the Booking System SHALL use snapshot data instead of querying the schedule service

### Requirement 7

**User Story:** Là một developer, tôi muốn API endpoints rõ ràng cho booking operations, để frontend có thể tích hợp dễ dàng.

#### Acceptance Criteria

1. WHEN frontend calls POST /api/bookings THEN the Booking System SHALL create a new booking and return booking details
2. WHEN frontend calls GET /api/bookings THEN the Booking System SHALL return all bookings for the authenticated user
3. WHEN frontend calls GET /api/bookings/{id} THEN the Booking System SHALL return detailed information for that specific booking
4. WHEN frontend calls PUT /api/bookings/{id}/cancel THEN the Booking System SHALL cancel the booking and return updated status
5. WHEN frontend calls PUT /api/bookings/{id}/confirm THEN the Booking System SHALL confirm the booking after payment verification

### Requirement 8

**User Story:** Là một system architect, tôi muốn Booking service tách biệt khỏi Ticket service về mặt logic, để dễ bảo trì và mở rộng.

#### Acceptance Criteria

1. WHEN designing the system THEN the Booking System SHALL maintain Booking entity separate from Ticket entity
2. WHEN a booking references a ticket THEN the Booking System SHALL store ticket ID as a foreign key reference
3. WHEN a booking references a schedule THEN the Booking System SHALL store schedule ID as a reference
4. WHEN booking operations occur THEN the Booking System SHALL update ticket quantities through the ticket repository
5. WHEN retrieving booking data THEN the Booking System SHALL join with ticket and schedule data as needed
