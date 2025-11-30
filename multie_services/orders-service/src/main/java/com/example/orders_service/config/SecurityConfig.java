package com.example.orders_service.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
// @EnableMethodSecurity // TEMPORARY: Disabled for testing
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        System.out.println("⚙️ SecurityConfig: DISABLING ALL SECURITY FOR TESTING");
        
        http.csrf(csrf -> csrf.disable());
        http.cors(cors -> cors.disable());
        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        
        // TEMPORARY: Permit ALL requests
        http.authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
        );

        http.httpBasic(h -> h.disable());
        http.formLogin(f -> f.disable());

        // TEMPORARY: Do NOT add JWT filter
        // http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        
        System.out.println("✅ SecurityConfig: ALL SECURITY DISABLED - ALL REQUESTS PERMITTED");

        return http.build();
    }
}
