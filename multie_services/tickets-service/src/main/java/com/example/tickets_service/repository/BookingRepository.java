package com.example.tickets_service.repository;

import com.example.tickets_service.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    // Tìm bookings theo user
    List<Booking> findByUserRefIdOrderByBookingDateDesc(Integer userRefId);
    
    // Tìm bookings theo order
    List<Booking> findByOrderRefId(Integer orderRefId);
    
    // Tìm booking theo ticket code
    Optional<Booking> findByTicketCode(String ticketCode);
    
    // Tìm bookings theo schedule
    List<Booking> findByScheduleRefId(Long scheduleRefId);
    
    // Đếm số bookings của user
    long countByUserRefId(Integer userRefId);
}
