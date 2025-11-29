package com.example.auth_service.config;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JwtUserPrincipal {
    private String username;
    private Long userId;
    private String role;
}