package com.example.tickets_service.client;

import com.example.tickets_service.dto.ScheduleResponse;
import com.example.tickets_service.exception.NotFoundException;
import com.example.tickets_service.exception.ServiceUnavailableException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class ScheduleClient {
    
    private final RestTemplate restTemplate;
    
    @Value("${schedule.service.url}")
    private String scheduleServiceUrl;
    
    /**
     * Fetches schedule data from the Schedule Service API
     * 
     * @param scheduleId The ID of the schedule to fetch
     * @return ScheduleResponse containing schedule details
     * @throws NotFoundException if the schedule is not found
     * @throws ServiceUnavailableException if the schedule service is unavailable
     */
    public ScheduleResponse getScheduleById(Long scheduleId) {
        try {
            String url = scheduleServiceUrl + "/" + scheduleId;
            
            // Get JWT token from security context
            HttpHeaders headers = new HttpHeaders();
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getCredentials() != null) {
                String token = authentication.getCredentials().toString();
                headers.set("Authorization", "Bearer " + token);
            }
            
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            
            ResponseEntity<ScheduleResponse> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                ScheduleResponse.class
            );
            return response.getBody();
        } catch (HttpClientErrorException.NotFound e) {
            throw new NotFoundException("Schedule not found with ID: " + scheduleId);
        } catch (HttpClientErrorException.Forbidden e) {
            throw new ServiceUnavailableException("Access denied to schedule service. Authentication required.");
        } catch (RestClientException e) {
            throw new ServiceUnavailableException("Schedule service is unavailable: " + e.getMessage());
        }
    }
    
    /**
     * Validates if a schedule exists and has the correct status
     * 
     * @param scheduleId The ID of the schedule to validate
     * @return true if the schedule exists and has status "scheduled"
     */
    public boolean isScheduleValid(Long scheduleId) {
        ScheduleResponse schedule = getScheduleById(scheduleId);
        return schedule != null && "scheduled".equals(schedule.getStatus());
    }
}
