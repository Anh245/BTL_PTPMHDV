package com.example.tickets_service.controller;

import com.example.tickets_service.dto.BookingRequest;
import com.example.tickets_service.dto.BookingResponse;
import com.example.tickets_service.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // 1. Create Booking - USER và ADMIN
    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<BookingResponse> create(@RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.createBooking(request));
    }

    // 2. Get All Bookings - ADMIN only
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponse>> getAll() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // 3. Get Booking By ID - USER và ADMIN
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<BookingResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    // 4. Get My Bookings - USER và ADMIN
    @GetMapping("/user/{userRefId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<BookingResponse>> getByUser(@PathVariable Integer userRefId) {
        return ResponseEntity.ok(bookingService.getBookingsByUser(userRefId));
    }

    // 5. Get Bookings By Order - USER và ADMIN
    @GetMapping("/order/{orderRefId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<BookingResponse>> getByOrder(@PathVariable Integer orderRefId) {
        return ResponseEntity.ok(bookingService.getBookingsByOrder(orderRefId));
    }

    // 6. Get Booking By Ticket Code - Public (for check-in)
    @GetMapping("/ticket-code/{ticketCode}")
    public ResponseEntity<BookingResponse> getByTicketCode(@PathVariable String ticketCode) {
        return ResponseEntity.ok(bookingService.getBookingByTicketCode(ticketCode));
    }

    // 7. Cancel Booking - USER và ADMIN
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<BookingResponse> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }

    // 8. Delete Booking - ADMIN only
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.ok("Booking deleted successfully");
    }
}
