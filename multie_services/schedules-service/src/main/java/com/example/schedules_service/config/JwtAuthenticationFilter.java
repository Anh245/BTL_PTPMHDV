package com.example.schedules_service.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    public JwtAuthenticationFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        // Bỏ qua filter đối với các đường dẫn public hoặc swagger
        return path.startsWith("/actuator") ||
                path.startsWith("/swagger-ui") ||
                path.startsWith("/v3/api-docs");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            try {
                // 1. Giải mã Token
                Jws<Claims> claims = jwtUtils.validateAndParse(token);
                String username = claims.getBody().getSubject();

                // 2. Lấy role (xử lý trường hợp role là String số ít như bên Auth/Stations service)
                String role = claims.getBody().get("role", String.class);

                if (role != null) {
                    // 3. Chuẩn hóa Role: Viết hoa & xử lý prefix
                    role = role.toUpperCase();
                    if (role.startsWith("ROLE_")) {
                        role = role.substring(5); // Cắt bỏ để thống nhất rồi cộng lại sau
                    }

                    // 4. Tạo Authority chuẩn Spring Security (Bắt buộc phải có ROLE_)
                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);

                    // 5. Tạo Authentication object
                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                    username,
                                    null,
                                    Collections.singletonList(authority)
                            );

                    // 6. Set vào Context để SecurityConfig nhận diện
                    SecurityContextHolder.getContext().setAuthentication(auth);
                } else {
                    System.err.println("WARN: Token hợp lệ nhưng không tìm thấy claim 'role'");
                }

            } catch (Exception e) {
                // Log lỗi (Token hết hạn, sai chữ ký, v.v.)
                System.err.println("JWT Validation Failed: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}