package com.example.auth_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SignUpRequest {
    @Email
    @NotBlank
    private String email;

    @NotBlank
    // note: spec calls the input "hashedPassword". We'll accept that param name but treat as raw password and hash it.
    private String password;

    @NotBlank
    private String username;

    private String firstname;
    private String lastname;

    // optional role selection; default USER
    private String role;
}
