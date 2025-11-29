package com.example.orders_service.config;

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
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    public JwtAuthenticationFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            try {
                // 1. Giải mã Token (Sử dụng JwtUtils của orders-service)
                Jws<Claims> claimsJws = jwtUtils.validateAndParse(token);
                Claims body = claimsJws.getBody();

                String username = body.getSubject();

                // 2. Lấy role từ claim "role" (theo code auth-service bạn cung cấp)
                String role = body.get("role", String.class);

                if (role != null) {
                    // 3. Quan trọng: Thêm tiền tố "ROLE_" nếu chưa có
                    // Auth-service lưu "USER" -> Cần chuyển thành "ROLE_USER"
                    String authorityRole = role.startsWith("ROLE_") ? role : "ROLE_" + role;

                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority(authorityRole);

                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                    username,
                                    null,
                                    Collections.singletonList(authority) // Chỉ có 1 role
                            );

                    SecurityContextHolder.getContext().setAuthentication(auth);
                }

            } catch (Exception e) {
                // Log lỗi để debug nếu cần
                System.err.println("JWT Authentication failed: " + e.getMessage());
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}