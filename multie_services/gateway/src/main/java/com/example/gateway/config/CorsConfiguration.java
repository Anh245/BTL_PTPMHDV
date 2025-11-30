package com.example.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

@Configuration
public class CorsConfiguration {

    @Bean
    public CorsWebFilter corsWebFilter() {
        org.springframework.web.cors.CorsConfiguration corsConfig = new org.springframework.web.cors.CorsConfiguration();
        
        // Cho phép credentials (cookies, authorization headers)
        corsConfig.setAllowCredentials(true);
        
        // Cho phép origins
        corsConfig.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:5173",  // Frontend Admin Dashboard
            "http://localhost:5174"   // Frontend Client Portal
        ));
        
        // Cho phép tất cả headers
        corsConfig.setAllowedHeaders(Collections.singletonList("*"));
        
        // Cho phép các HTTP methods
        corsConfig.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));
        
        // Expose headers
        corsConfig.setExposedHeaders(Arrays.asList(
            "Authorization", "Content-Type", "Set-Cookie"
        ));
        
        // Max age cho preflight requests
        corsConfig.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);
        
        return new CorsWebFilter(source);
    }
}
