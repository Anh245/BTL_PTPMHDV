package com.example.orders_service.client;

import com.example.orders_service.dto.TicketResponse;
import com.example.orders_service.exception.ServiceUnavailableException;
import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * Client for communicating with the Tickets Service.
 * Handles ticket quantity management and ticket information retrieval.
 * Uses circuit breaker pattern to handle service unavailability gracefully.
 */
@Component
@Slf4j
public class TicketsServiceClient {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${tickets.service.url}")
    private String ticketsServiceUrl;

    /**
     * Retrieves ticket information by ticket ID.
     * Protected by circuit breaker to handle service unavailability.
     * 
     * @param ticketId the ID of the ticket to retrieve
     * @return TicketResponse containing ticket details
     * @throws ServiceUnavailableException if the service is unavailable or circuit is open
     */
    @CircuitBreaker(name = "ticketsService", fallbackMethod = "getTicketFallback")
    public TicketResponse getTicket(Integer ticketId) {
        String url = ticketsServiceUrl + "/api/tickets/" + ticketId;
        
        log.info("Fetching ticket information for ticketId: {}", ticketId);
        
        try {
            TicketResponse response = restTemplate.getForObject(url, TicketResponse.class);
            log.info("Successfully retrieved ticket: {}", ticketId);
            return response;
        } catch (RestClientException e) {
            log.error("Failed to fetch ticket with ID: {}. Error: {}", ticketId, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Fallback method for getTicket when circuit breaker is open or service fails.
     * 
     * @param ticketId the ID of the ticket
     * @param throwable the exception that triggered the fallback
     * @throws ServiceUnavailableException always, with appropriate error message
     */
    private TicketResponse getTicketFallback(Integer ticketId, Throwable throwable) {
        if (throwable instanceof CallNotPermittedException) {
            log.error("Circuit breaker is OPEN for Tickets Service. TicketId: {}", ticketId);
            throw new ServiceUnavailableException("Tickets service is temporarily unavailable. Circuit breaker is open. Please try again later.");
        }
        
        log.error("Fallback triggered for getTicket. TicketId: {}, Error: {}", ticketId, throwable.getMessage());
        throw new ServiceUnavailableException("Tickets service is temporarily unavailable. Please try again later.");
    }

    /**
     * Decreases the available quantity of a ticket.
     * Called when an order is created to reserve tickets.
     * Protected by circuit breaker to handle service unavailability.
     * 
     * @param ticketId the ID of the ticket
     * @param quantity the quantity to decrease
     * @throws ServiceUnavailableException if the service is unavailable or circuit is open
     */
    @CircuitBreaker(name = "ticketsService", fallbackMethod = "decreaseTicketQuantityFallback")
    public void decreaseTicketQuantity(Integer ticketId, Integer quantity) {
        String url = ticketsServiceUrl + "/api/tickets/" + ticketId + "/decrease-quantity";
        
        log.info("Decreasing ticket quantity for ticketId: {}, quantity: {}", ticketId, quantity);
        
        try {
            Map<String, Integer> params = new HashMap<>();
            params.put("quantity", quantity);
            
            restTemplate.put(url + "?quantity=" + quantity, null);
            log.info("Successfully decreased ticket quantity for ticketId: {}", ticketId);
        } catch (RestClientException e) {
            log.error("Failed to decrease ticket quantity for ticketId: {}. Error: {}", ticketId, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Fallback method for decreaseTicketQuantity when circuit breaker is open or service fails.
     * 
     * @param ticketId the ID of the ticket
     * @param quantity the quantity to decrease
     * @param throwable the exception that triggered the fallback
     * @throws ServiceUnavailableException always, with appropriate error message
     */
    private void decreaseTicketQuantityFallback(Integer ticketId, Integer quantity, Throwable throwable) {
        if (throwable instanceof CallNotPermittedException) {
            log.error("Circuit breaker is OPEN for Tickets Service. Cannot decrease quantity for ticketId: {}", ticketId);
            throw new ServiceUnavailableException("Tickets service is temporarily unavailable. Circuit breaker is open. Cannot process order at this time.");
        }
        
        log.error("Fallback triggered for decreaseTicketQuantity. TicketId: {}, Quantity: {}, Error: {}", 
                ticketId, quantity, throwable.getMessage());
        throw new ServiceUnavailableException("Tickets service is temporarily unavailable. Cannot process order at this time.");
    }

    /**
     * Increases the available quantity of a ticket.
     * Called when an order is cancelled to restore tickets.
     * Protected by circuit breaker to handle service unavailability.
     * 
     * @param ticketId the ID of the ticket
     * @param quantity the quantity to increase
     * @throws ServiceUnavailableException if the service is unavailable or circuit is open
     */
    @CircuitBreaker(name = "ticketsService", fallbackMethod = "increaseTicketQuantityFallback")
    public void increaseTicketQuantity(Integer ticketId, Integer quantity) {
        String url = ticketsServiceUrl + "/api/tickets/" + ticketId + "/increase-quantity";
        
        log.info("Increasing ticket quantity for ticketId: {}, quantity: {}", ticketId, quantity);
        
        try {
            restTemplate.put(url + "?quantity=" + quantity, null);
            log.info("Successfully increased ticket quantity for ticketId: {}", ticketId);
        } catch (RestClientException e) {
            log.error("Failed to increase ticket quantity for ticketId: {}. Error: {}", ticketId, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Fallback method for increaseTicketQuantity when circuit breaker is open or service fails.
     * 
     * @param ticketId the ID of the ticket
     * @param quantity the quantity to increase
     * @param throwable the exception that triggered the fallback
     * @throws ServiceUnavailableException always, with appropriate error message
     */
    private void increaseTicketQuantityFallback(Integer ticketId, Integer quantity, Throwable throwable) {
        if (throwable instanceof CallNotPermittedException) {
            log.error("Circuit breaker is OPEN for Tickets Service. Cannot increase quantity for ticketId: {}", ticketId);
            throw new ServiceUnavailableException("Tickets service is temporarily unavailable. Circuit breaker is open. Cannot restore ticket quantity at this time.");
        }
        
        log.error("Fallback triggered for increaseTicketQuantity. TicketId: {}, Quantity: {}, Error: {}", 
                ticketId, quantity, throwable.getMessage());
        throw new ServiceUnavailableException("Tickets service is temporarily unavailable. Cannot restore ticket quantity at this time.");
    }
}
