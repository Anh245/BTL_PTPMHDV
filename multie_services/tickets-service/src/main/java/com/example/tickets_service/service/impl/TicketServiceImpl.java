package com.example.tickets_service.service.impl;

import com.example.tickets_service.dto.TicketRequest;
import com.example.tickets_service.dto.TicketResponse;
import com.example.tickets_service.entity.Ticket;
import com.example.tickets_service.exception.NotFoundException;
import com.example.tickets_service.repository.TicketRepository;
import com.example.tickets_service.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;

    @Override
    public TicketResponse create(TicketRequest request) {
        try {
            Ticket ticket = new Ticket();
            mapRequestToEntity(request, ticket);
            ticket.setCreatedAt(LocalDateTime.now());

            // Mặc định status active nếu null
            if (ticket.getStatus() == null) {
                ticket.setStatus(Ticket.Status.active);
            }

            return mapEntityToResponse(ticketRepository.save(ticket));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status value: " + request.getStatus(), e);
        } catch (Exception e) {
            throw new RuntimeException("Error creating ticket: " + e.getMessage(), e);
        }
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

        // Update các trường nếu request có gửi lên (Partial update logic)
        if (request.getName() != null) ticket.setName(request.getName());
        if (request.getTrainNumber() != null) ticket.setTrainNumber(request.getTrainNumber());
        if (request.getFromStation() != null) ticket.setFromStation(request.getFromStation());
        if (request.getToStation() != null) ticket.setToStation(request.getToStation());
        if (request.getPrice() != null) ticket.setPrice(request.getPrice());
        if (request.getDate() != null) ticket.setDate(request.getDate());
        if (request.getDescription() != null) ticket.setDescription(request.getDescription());
        
        // Update quantity fields
        if (request.getTotalQuantity() != null) ticket.setTotalQuantity(request.getTotalQuantity());
        if (request.getSoldQuantity() != null) ticket.setSoldQuantity(request.getSoldQuantity());

        if (request.getStatus() != null) {
            ticket.setStatus(Ticket.Status.valueOf(request.getStatus()));
        }

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

    // Mapper Helper Methods
    private void mapRequestToEntity(TicketRequest req, Ticket entity) {
        entity.setName(req.getName());
        entity.setTrainNumber(req.getTrainNumber());
        entity.setFromStation(req.getFromStation());
        entity.setToStation(req.getToStation());
        entity.setPrice(req.getPrice());
        entity.setDate(req.getDate());
        entity.setDescription(req.getDescription());
        
        // Set quantity fields
        System.out.println("DEBUG: Request totalQuantity = " + req.getTotalQuantity());
        System.out.println("DEBUG: Request soldQuantity = " + req.getSoldQuantity());
        
        if (req.getTotalQuantity() != null) {
            entity.setTotalQuantity(req.getTotalQuantity());
        } else {
            entity.setTotalQuantity(0); // Default to 0 if not provided
        }
        if (req.getSoldQuantity() != null) {
            entity.setSoldQuantity(req.getSoldQuantity());
        } else {
            entity.setSoldQuantity(0); // Default to 0 if not provided
        }
        
        System.out.println("DEBUG: Entity totalQuantity = " + entity.getTotalQuantity());
        System.out.println("DEBUG: Entity soldQuantity = " + entity.getSoldQuantity());
        
        if (req.getStatus() != null) {
            entity.setStatus(Ticket.Status.valueOf(req.getStatus()));
        }
    }

    private TicketResponse mapEntityToResponse(Ticket entity) {
        TicketResponse res = new TicketResponse();
        res.setId(entity.getId());
        res.setName(entity.getName());
        res.setTrainNumber(entity.getTrainNumber());
        res.setFromStation(entity.getFromStation());
        res.setToStation(entity.getToStation());
        res.setPrice(entity.getPrice());
        res.setDate(entity.getDate());
        res.setDescription(entity.getDescription());
        res.setTotalQuantity(entity.getTotalQuantity());
        res.setSoldQuantity(entity.getSoldQuantity());
        res.setAvailableQuantity(entity.getAvailableQuantity()); // Computed field
        res.setStatus(entity.getStatus().name());
        res.setCreatedAt(entity.getCreatedAt());
        return res;
    }
}