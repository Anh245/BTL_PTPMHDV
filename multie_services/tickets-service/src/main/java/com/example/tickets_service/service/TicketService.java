package com.example.tickets_service.service;

import com.example.tickets_service.dto.TicketRequest;
import com.example.tickets_service.dto.TicketResponse;

import java.util.List;

public interface TicketService {
    TicketResponse create(TicketRequest request);
    List<TicketResponse> getAll();
    TicketResponse getById(Long id);
    TicketResponse update(Long id, TicketRequest request);
    void delete(Long id);
    TicketResponse purchaseTickets(Long id, Integer quantity);
}
