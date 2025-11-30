package com.example.orders_service.client;

import com.example.orders_service.dto.PaymentRequest;
import com.example.orders_service.dto.PaymentResponse;
import com.example.orders_service.exception.ServiceUnavailableException;
import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * Client for communicating with the Payment Service.
 * Handles payment processing with extended timeout for payment operations.
 * Uses circuit breaker pattern to handle service unavailability gracefully.
 */
@Component
@Slf4j
public class PaymentServiceClient {

    private final RestTemplate restTemplate;
    
    @Value("${payment.service.url}")
    private String paymentServiceUrl;

    /**
     * Constructor that creates a RestTemplate with payment-specific timeout configuration.
     * Payment operations require longer timeout (10 seconds) due to external gateway communication.
     */
    public PaymentServiceClient(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(10))
                .setReadTimeout(Duration.ofSeconds(10))
                .build();
    }

    /**
     * Processes a payment through the Payment Service.
     * Protected by circuit breaker to handle service unavailability.
     * 
     * @param request PaymentRequest containing order ID, amount, and payment method
     * @return PaymentResponse containing transaction ID, status, and message
     * @throws ServiceUnavailableException if the Payment Service is unavailable or circuit is open
     */
    @CircuitBreaker(name = "paymentService", fallbackMethod = "processPaymentFallback")
    public PaymentResponse processPayment(PaymentRequest request) {
        String url = paymentServiceUrl + "/api/payment/process";
        
        log.info("Processing payment for orderId: {}, amount: {}, method: {}", 
                request.getOrderId(), request.getAmount(), request.getPaymentMethod());
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<PaymentRequest> entity = new HttpEntity<>(request, headers);
            
            PaymentResponse response = restTemplate.postForObject(url, entity, PaymentResponse.class);
            
            if (response != null) {
                log.info("Payment processing completed for orderId: {}. Status: {}, TransactionId: {}", 
                        request.getOrderId(), response.getStatus(), response.getTransactionId());
            } else {
                log.error("Payment service returned null response for orderId: {}", request.getOrderId());
                throw new ServiceUnavailableException("Payment service returned invalid response");
            }
            
            return response;
            
        } catch (ResourceAccessException e) {
            log.error("Payment service is unavailable for orderId: {}. Error: {}", 
                    request.getOrderId(), e.getMessage());
            throw new ServiceUnavailableException("Payment service is temporarily unavailable. Please try again later.");
            
        } catch (RestClientException e) {
            log.error("Failed to process payment for orderId: {}. Error: {}", 
                    request.getOrderId(), e.getMessage());
            throw new ServiceUnavailableException("Failed to process payment: " + e.getMessage());
        }
    }
    
    /**
     * Fallback method for processPayment when circuit breaker is open or service fails.
     * 
     * @param request the payment request
     * @param throwable the exception that triggered the fallback
     * @throws ServiceUnavailableException always, with appropriate error message
     */
    private PaymentResponse processPaymentFallback(PaymentRequest request, Throwable throwable) {
        if (throwable instanceof CallNotPermittedException) {
            log.error("Circuit breaker is OPEN for Payment Service. Cannot process payment for orderId: {}", 
                    request.getOrderId());
            throw new ServiceUnavailableException("Payment service is temporarily unavailable. Circuit breaker is open. Please try again later.");
        }
        
        log.error("Fallback triggered for processPayment. OrderId: {}, Error: {}", 
                request.getOrderId(), throwable.getMessage());
        throw new ServiceUnavailableException("Payment service is temporarily unavailable. Please try again later.");
    }
}
