package com.example.trains_service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import jakarta.servlet.http.HttpServletResponse;
import java.util.HashMap;
import java.util.Map;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(unauthorizedHandler())
                        .accessDeniedHandler(accessDeniedHandler())
                )
                .authorizeHttpRequests(auth -> auth
                        // 1. Các endpoint hệ thống (Swagger, Actuator) -> Public
                        .requestMatchers("/actuator/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()

                        // 2. GET API: Public (Cho phép khách xem danh sách tàu để tìm kiếm)
                        // Nếu muốn bắt buộc đăng nhập mới xem được thì đổi .permitAll() thành .hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/trains/**").permitAll()

                        // 3. CÁC HÀNH ĐỘNG THAY ĐỔI DỮ LIỆU -> CHỈ ADMIN
                        .requestMatchers(HttpMethod.POST, "/api/trains/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/trains/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/trains/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/trains/**").hasRole("ADMIN")

                        // 4. Các request còn lại bắt buộc phải đăng nhập
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Bean xử lý lỗi 401 (Chưa đăng nhập) trả về JSON đẹp
    @Bean
    public AuthenticationEntryPoint unauthorizedHandler() {
        return (request, response, authException) -> {
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            Map<String, Object> body = new HashMap<>();
            body.put("status", 401);
            body.put("error", "Unauthorized");
            body.put("message", "Yêu cầu cần đăng nhập để thực hiện");
            new ObjectMapper().writeValue(response.getOutputStream(), body);
        };
    }

    // Bean xử lý lỗi 403 (Không có quyền) trả về JSON đẹp
    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            Map<String, Object> body = new HashMap<>();
            body.put("status", 403);
            body.put("error", "Forbidden");
            body.put("message", "Bạn không có quyền ADMIN để thực hiện hành động này");
            new ObjectMapper().writeValue(response.getOutputStream(), body);
        };
    }
}