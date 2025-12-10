package com.example.tickets_service.config;

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
@EnableMethodSecurity // <--- 1. QUAN TRỌNG: Dòng này kích hoạt @PreAuthorize bên Controller
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        System.out.println("🔒 Tickets SecurityConfig: SECURITY ENABLED (JWT + RBAC)"); // Update log để dễ debug

        http.csrf(csrf -> csrf.disable());
        http.cors(cors -> cors.disable()); // Hoặc config CORS nếu FE gọi trực tiếp
        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.authorizeHttpRequests(auth -> auth
                // Nếu có các endpoint public (ví dụ swagger), khai báo ở đây:
                // .requestMatchers("/v3/api-docs/**", "/swagger-ui/**").permitAll()

                // Tất cả các request khác bắt buộc phải có Token (Authenticated)
                // Việc user có quyền ADMIN hay USER sẽ do Controller quyết định
                .anyRequest().authenticated()
        );

        // <--- 2. QUAN TRỌNG: Thêm filter để giải mã JWT Token
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}