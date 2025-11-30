package com.example.orders_service.client;

import com.example.orders_service.dto.ScheduleResponse;
import com.example.orders_service.exception.ServiceUnavailableException;
import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

/**
 * Client for communicating with the Schedules Service.
 * Handles schedule information retrieval for creating order snapshots.
 * Uses circuit breaker pattern to handle service unavailability gracefully.
 */
@Component
@Slf4j
public class ScheduleServiceClient {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${schedules.service.url}")
    private String schedulesServiceUrl;

    /**
     * Retrieves schedule information by schedule ID.
     * Protected by circuit breaker to handle service unavailability.
     * 
     * @param scheduleId the ID of the schedule to retrieve
     * @return ScheduleResponse containing schedule details
     * @throws ServiceUnavailableException if the service is unavailable or circuit is open
     */
    @CircuitBreaker(name = "schedulesService", fallbackMethod = "getScheduleFallback")
    public ScheduleResponse getSchedule(Integer scheduleId) {
        String url = schedulesServiceUrl + "/api/schedules/" + scheduleId;
        
        log.info("Fetching schedule information for scheduleId: {}", scheduleId);
        
        try {
            ScheduleResponse response = restTemplate.getForObject(url, ScheduleResponse.class);
            log.info("Successfully retrieved schedule: {}", scheduleId);
            return response;
        } catch (RestClientException e) {
            log.error("Failed to fetch schedule with ID: {}. Error: {}", scheduleId, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Fallback method for getSchedule when circuit breaker is open or service fails.
     * 
     * @param scheduleId the ID of the schedule
     * @param throwable the exception that triggered the fallback
     * @throws ServiceUnavailableException always, with appropriate error message
     */
    private ScheduleResponse getScheduleFallback(Integer scheduleId, Throwable throwable) {
        if (throwable instanceof CallNotPermittedException) {
            log.error("Circuit breaker is OPEN for Schedules Service. ScheduleId: {}", scheduleId);
            throw new ServiceUnavailableException("Schedules service is temporarily unavailable. Circuit breaker is open. Please try again later.");
        }
        
        log.error("Fallback triggered for getSchedule. ScheduleId: {}, Error: {}", scheduleId, throwable.getMessage());
        throw new ServiceUnavailableException("Schedules service is temporarily unavailable. Please try again later.");
    }
}
