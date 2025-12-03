package com.example.auth_service.dto;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String firstname;
    private String lastname;
    
    @Email(message = "Email không hợp lệ")
    private String email;
}
