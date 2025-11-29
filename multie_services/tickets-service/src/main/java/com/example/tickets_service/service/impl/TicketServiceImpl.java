package com.example.tickets_service.service.impl;

import com.example.tickets_service.client.ScheduleClient;
import com.example.tickets_service.dto.ScheduleResponse;
import com.example.tickets_service.dto.TicketRequest;
import com.example.tickets_service.dto.TicketResponse;
import com.example.tickets_service.entity.Ticket;
import com.example.tickets_service.exception.BadRequestException;
import com.example.tickets_service.exception.NotFoundException;
import com.example.tickets_service.repository.TicketRepository;
import com.example.tickets_service.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final ScheduleClient scheduleClient;

    @Override
    public TicketResponse create(TicketRequest request) {
        // 1. Create ticket entity from request
        Ticket ticket = new Ticket();
        ticket.setName(request.getName());
        ticket.setScheduleRefId(request.getScheduleRefId());
        ticket.setPrice(request.getPrice());
        ticket.setDescription(request.getDescription());
        ticket.setTotalQuantity(request.getTotalQuantity());
        
        // 2. Fetch schedule data from API and populate snapshot fields
        validateAndPopulateScheduleData(ticket, request.getScheduleRefId());
        
        // 3. Set default values
        ticket.setSoldQuantity(0);
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setStatus(request.getStatus() != null ? 
            Ticket.Status.valueOf(request.getStatus()) : Ticket.Status.active);
        
        // 4. Save ticket
        Ticket savedTicket = ticketRepository.save(ticket);
        
        // 5. Return response
        return mapEntityToResponse(savedTicket);
    }

    @Override
    public List<TicketResponse> getAll() {
        return ticketRepository.findAll().stream()
                .map(this::mapEntityToResponse)
                .toList();
    }

    @Override
    public TicketResponse getById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Ticket not found with id: " + id));
        return mapEntityToResponse(ticket);
    }

    @Override
    public TicketResponse update(Long id, TicketRequest request) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Ticket not found with id: " + id));

        // Validate immutable fields - scheduleRefId cannot be modified
        if (request.getScheduleRefId() != null && 
            !request.getScheduleRefId().equals(ticket.getScheduleRefId())) {
            throw new BadRequestException("Schedule reference cannot be modified");
        }

        // Update mutable fields only
        if (request.getName() != null) {
            ticket.setName(request.getName());
        }
        
        if (request.getPrice() != null) {
            // Validate price is positive
            if (request.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Price must be greater than 0");
            }
            ticket.setPrice(request.getPrice());
        }
        
        if (request.getDescription() != null) {
            ticket.setDescription(request.getDescription());
        }
        
        if (request.getTotalQuantity() != null) {
            // Validate totalQuantity is greater than or equal to soldQuantity
            if (request.getTotalQuantity() < ticket.getSoldQuantity()) {
                throw new BadRequestException(
                    String.format("Total quantity (%d) cannot be less than sold quantity (%d)", 
                        request.getTotalQuantity(), ticket.getSoldQuantity())
                );
            }
            ticket.setTotalQuantity(request.getTotalQuantity());
        }

        if (request.getStatus() != null) {
            ticket.setStatus(Ticket.Status.valueOf(request.getStatus()));
        }

        // Note: scheduleRefId and snapshot fields (trainNumberSnapshot, routeSnapshot, 
        // departureTimeSnapshot) are immutable and are never modified during update

        return mapEntityToResponse(ticketRepository.save(ticket));
    }

    @Override
    public void delete(Long id) {
        if (!ticketRepository.existsById(id)) {
            throw new NotFoundException("Ticket not found with id: " + id);
        }
        ticketRepository.deleteById(id);
    }

    @Override
    public TicketResponse purchaseTickets(Long id, Integer quantity) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Ticket not found with id: " + id));

        // Validate quantity
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }

        // Check if enough tickets available
        Integer availableQuantity = ticket.getAvailableQuantity();
        if (availableQuantity < quantity) {
            throw new IllegalArgumentException(
                String.format("Not enough tickets available. Requested: %d, Available: %d", 
                    quantity, availableQuantity)
            );
        }

        // Update sold quantity
        ticket.setSoldQuantity(ticket.getSoldQuantity() + quantity);

        // Auto update status to sold_out if no tickets left
        if (ticket.getAvailableQuantity() == 0) {
            ticket.setStatus(Ticket.Status.sold_out);
        }

        Ticket updatedTicket = ticketRepository.save(ticket);
        return mapEntityToResponse(updatedTicket);
    }

    /**
     * Validates schedule exists and has correct status, then populates snapshot data
     * 
     * @param ticket The ticket entity to populate
     * @param scheduleRefId The schedule reference ID
     * @throws NotFoundException if schedule is not found
     * @throws BadRequestException if schedule status is not "scheduled"
     */
    private void validateAndPopulateScheduleData(Ticket ticket, Long scheduleRefId) {
        // 1. Fetch schedule from ScheduleService via HTTP API
        ScheduleResponse schedule = scheduleClient.getScheduleById(scheduleRefId);
        
        // 2. Validate schedule exists (handled by client throwing NotFoundException)
        if (schedule == null) {
            throw new NotFoundException("Schedule not found with ID: " + scheduleRefId);
        }
        
        // 3. Validate schedule status is 'scheduled'
        if (!"scheduled".equals(schedule.getStatus())) {
            String status = schedule.getStatus();
            if ("cancelled".equals(status)) {
                throw new BadRequestException("Cannot create ticket for cancelled schedule");
            } else if ("departed".equals(status)) {
                throw new BadRequestException("Cannot create ticket for departed schedule");
            } else {
                throw new BadRequestException("Cannot create ticket for " + status + " schedule");
            }
        }
        
        // 4. Populate snapshot fields from API response
        populateSnapshotData(ticket, schedule);
    }
    
    /**
     * Populates snapshot data fields from schedule response
     * 
     * @param ticket The ticket entity to populate
     * @param schedule The schedule response from API
     */
    private void populateSnapshotData(Ticket ticket, ScheduleResponse schedule) {
        // Set snapshot data from schedule API response
        ticket.setTrainNumberSnapshot(schedule.getTrainNumberSnapshot());
        ticket.setRouteSnapshot(
            schedule.getDepartureStationNameSnapshot() + " → " + 
            schedule.getArrivalStationNameSnapshot()
        );
        ticket.setDepartureTimeSnapshot(schedule.getDepartureTime());
        
        // Set departure date from departure time
        if (schedule.getDepartureTime() != null) {
            ticket.setDepartureDate(schedule.getDepartureTime().toLocalDate());
        }
        
        // Populate legacy fields for backward compatibility
        ticket.setTrainNumber(schedule.getTrainNumberSnapshot());
        ticket.setFromStation(schedule.getDepartureStationNameSnapshot());
        ticket.setToStation(schedule.getArrivalStationNameSnapshot());
    }

    // Mapper Helper Methods
    private TicketResponse mapEntityToResponse(Ticket entity) {
        TicketResponse res = new TicketResponse();
        res.setId(entity.getId());
        res.setName(entity.getName());
        res.setScheduleRefId(entity.getScheduleRefId());
        
        // Handle potentially null snapshot data for backward compatibility
        res.setTrainNumberSnapshot(entity.getTrainNumberSnapshot() != null ? 
            entity.getTrainNumberSnapshot() : "N/A");
        res.setRouteSnapshot(entity.getRouteSnapshot() != null ? 
            entity.getRouteSnapshot() : "N/A");
        res.setDepartureTimeSnapshot(entity.getDepartureTimeSnapshot());
        
        res.setPrice(entity.getPrice());
        res.setDescription(entity.getDescription());
        res.setTotalQuantity(entity.getTotalQuantity());
        res.setSoldQuantity(entity.getSoldQuantity());
        res.setAvailableQuantity(entity.getAvailableQuantity()); // Computed field
        res.setStatus(entity.getStatus().name());
        res.setCreatedAt(entity.getCreatedAt());
        return res;
    }
}