package com.example.auth_service.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<?> handleUnauthorized(SecurityException ex) {
        // map SecurityException messages in service to 401/403 depending where used
        String msg = ex.getMessage();
        if ("No token found".equals(msg) || msg.contains("username/password")) {
            return ResponseEntity.status(401).body(msg);
        }
        return ResponseEntity.status(403).body(msg);
    }
}