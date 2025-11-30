package com.example.orders_service.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<?> handleNotFound(NotFoundException ex) {
        return ResponseEntity.status(404).body(createErrorResponse(404, "Not Found", ex.getMessage()));
    }

    @ExceptionHandler(InsufficientTicketsException.class)
    public ResponseEntity<?> handleInsufficientTickets(InsufficientTicketsException ex) {
        return ResponseEntity.status(400).body(createErrorResponse(400, "Bad Request", ex.getMessage()));
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<?> handleValidation(ValidationException ex) {
        return ResponseEntity.status(400).body(createErrorResponse(400, "Bad Request", ex.getMessage()));
    }

    @ExceptionHandler(ServiceUnavailableException.class)
    public ResponseEntity<?> handleServiceUnavailable(ServiceUnavailableException ex) {
        return ResponseEntity.status(503).body(createErrorResponse(503, "Service Unavailable", ex.getMessage()));
    }

    private Map<String, Object> createErrorResponse(int status, String error, String message) {
        Map<String, Object> errorResponse = new LinkedHashMap<>();
        errorResponse.put("timestamp", LocalDateTime.now());
        errorResponse.put("status", status);
        errorResponse.put("error", error);
        errorResponse.put("message", message);
        return errorResponse;
    }

    // Spring Security sẽ tự trả về 401/403 nếu lỗi Authen/Author,
    // nhưng có thể handle thêm các lỗi khác ở đây.
}
