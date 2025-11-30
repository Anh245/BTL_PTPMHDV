package com.example.tickets_service.service.impl;

import com.example.tickets_service.dto.BookingRequest;
import com.example.tickets_service.dto.BookingResponse;
import com.example.tickets_service.entity.Booking;
import com.example.tickets_service.exception.NotFoundException;
import com.example.tickets_service.repository.BookingRepository;
import com.example.tickets_service.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;

    @Override
    public BookingResponse createBooking(BookingRequest request) {
        Booking booking = new Booking();
        
        booking.setOrderRefId(request.getOrderRefId());
        booking.setUserRefId(request.getUserRefId());
        booking.setScheduleRefId(request.getScheduleRefId());
        booking.setTicketRefId(request.getTicketRefId());
        
        booking.setPassengerName(request.getPassengerName());
        booking.setPassengerEmail(request.getPassengerEmail());
        booking.setPassengerPhone(request.getPassengerPhone());
        booking.setPassengerIdNumber(request.getPassengerIdNumber());
        
        booking.setSeatNumber(request.getSeatNumber());
        booking.setPrice(request.getPrice());
        
        // Generate unique ticket code
        String ticketCode = Booking.generateTicketCode(
            request.getScheduleRefId(), 
            request.getSeatNumber()
        );
        booking.setTicketCode(ticketCode);
        
        // Snapshot data
        booking.setTrainNumberSnapshot(request.getTrainNumberSnapshot());
        booking.setDepartureStationSnapshot(request.getDepartureStationSnapshot());
        booking.setArrivalStationSnapshot(request.getArrivalStationSnapshot());
        booking.setDepartureTimeSnapshot(request.getDepartureTimeSnapshot());
        
        booking.setStatus(Booking.Status.confirmed);
        
        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Booking not found with id: " + id));
        return mapToResponse(booking);
    }

    @Override
    public List<BookingResponse> getBookingsByUser(Integer userRefId) {
        return bookingRepository.findByUserRefIdOrderByBookingDateDesc(userRefId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getBookingsByOrder(Integer orderRefId) {
        return bookingRepository.findByOrderRefId(orderRefId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponse getBookingByTicketCode(String ticketCode) {
        Booking booking = bookingRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new NotFoundException("Booking not found with ticket code: " + ticketCode));
        return mapToResponse(booking);
    }

    @Override
    public BookingResponse cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Booking not found with id: " + id));
        
        booking.setStatus(Booking.Status.cancelled);
        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    @Override
    public void deleteBooking(Long id) {
        if (!bookingRepository.existsById(id)) {
            throw new NotFoundException("Booking not found with id: " + id);
        }
        bookingRepository.deleteById(id);
    }

    // Helper: Map Entity -> Response
    private BookingResponse mapToResponse(Booking entity) {
        BookingResponse response = new BookingResponse();
        
        response.setId(entity.getId());
        response.setOrderRefId(entity.getOrderRefId());
        response.setUserRefId(entity.getUserRefId());
        response.setScheduleRefId(entity.getScheduleRefId());
        response.setTicketRefId(entity.getTicketRefId());
        
        response.setPassengerName(entity.getPassengerName());
        response.setPassengerEmail(entity.getPassengerEmail());
        response.setPassengerPhone(entity.getPassengerPhone());
        response.setPassengerIdNumber(entity.getPassengerIdNumber());
        
        response.setSeatNumber(entity.getSeatNumber());
        response.setTicketCode(entity.getTicketCode());
        response.setPrice(entity.getPrice());
        
        response.setTrainNumberSnapshot(entity.getTrainNumberSnapshot());
        response.setDepartureStationSnapshot(entity.getDepartureStationSnapshot());
        response.setArrivalStationSnapshot(entity.getArrivalStationSnapshot());
        response.setDepartureTimeSnapshot(entity.getDepartureTimeSnapshot());
        
        response.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
        response.setBookingDate(entity.getBookingDate());
        response.setCreatedAt(entity.getCreatedAt());
        
        return response;
    }
}
