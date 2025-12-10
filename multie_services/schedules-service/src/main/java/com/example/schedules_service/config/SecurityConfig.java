package com.example.schedules_service.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Hỗ trợ @PreAuthorize trong Controller
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Tắt CSRF vì dùng JWT (Stateless)
                .csrf(csrf -> csrf.disable())

                // Không lưu session phía server
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Tắt form login mặc định
                .formLogin(f -> f.disable())
                .httpBasic(h -> h.disable())

                // Cấu hình phân quyền
                .authorizeHttpRequests(auth -> auth
                        // Các endpoint public (Swagger, Actuator)
                        .requestMatchers("/actuator/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()

                        // --- [SỬA ĐỔI QUAN TRỌNG] ---
                        // Đã xóa dòng permitAll cho /api/schedules/** để đảm bảo bảo mật.
                        // Các request vào đây bắt buộc phải có Token hợp lệ (Authenticated).
                        // Việc phân quyền cụ thể (ADMIN/USER) sẽ do @PreAuthorize ở Controller xử lý.
                        .requestMatchers("/api/schedules/**").authenticated()

                        // Các request còn lại bắt buộc phải đăng nhập
                        .anyRequest().authenticated()
                )

                // Thêm Filter JWT vào trước filter xác thực mặc định
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}