package com.example.stations_service.config;

import com.fasterxml.jackson.databind.ObjectMapper; // Cần thêm import này để ghi JSON
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType; // Cần thêm import
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import jakarta.servlet.http.HttpServletResponse; // Cần thêm import
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())

                // 1. Cấu hình xử lý lỗi trả về JSON thay vì trang lỗi mặc định
                .exceptionHandling(exception -> exception
                        // Xử lý 401 Unauthorized (Chưa có token hoặc token sai)
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

                            Map<String, Object> body = new HashMap<>();
                            body.put("status", 401);
                            body.put("error", "Unauthorized");
                            body.put("message", "Không thể xác thực người dùng"); // Khớp với TC_3

                            new ObjectMapper().writeValue(response.getOutputStream(), body);
                        })
                        // Xử lý 403 Forbidden (Có token nhưng không đủ quyền Admin)
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);

                            Map<String, Object> body = new HashMap<>();
                            body.put("status", 403);
                            body.put("error", "Forbidden");
                            body.put("message", "Truy cập bị từ chối"); // Khớp với TC_2

                            new ObjectMapper().writeValue(response.getOutputStream(), body);
                        })
                )

                // 2. Phân quyền
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/**", "/swagger-ui/**", "/v3/api-docs/**", "/api/auth/**").permitAll()
                        // Đã xóa dòng permitAll cho stations để kích hoạt bảo mật
                        .anyRequest().authenticated()
                );

        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}