package com.example.orders_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Represents passenger information for a booking.
 * This class is used for JSON serialization/deserialization of passenger details.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PassengerInfo {
    
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    @NotBlank(message = "ID number is required")
    private String idNumber;
    
    @NotBlank(message = "Phone number is required")
    private String phoneNumber;
    
    @Email(message = "Email must be valid")
    @NotBlank(message = "Email is required")
    private String email;
}
