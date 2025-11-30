package com.example.tickets_service.service;

import com.example.tickets_service.dto.BookingRequest;
import com.example.tickets_service.dto.BookingResponse;

import java.util.List;

public interface BookingService {
    BookingResponse createBooking(BookingRequest request);
    List<BookingResponse> getAllBookings();
    BookingResponse getBookingById(Long id);
    List<BookingResponse> getBookingsByUser(Integer userRefId);
    List<BookingResponse> getBookingsByOrder(Integer orderRefId);
    BookingResponse getBookingByTicketCode(String ticketCode);
    BookingResponse cancelBooking(Long id);
    void deleteBooking(Long id);
}
