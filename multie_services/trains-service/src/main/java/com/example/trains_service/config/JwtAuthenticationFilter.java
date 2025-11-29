package com.example.trains_service.config;

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
import java.util.Collections; // Import thêm để dùng Collections.singletonList hoặc List.of

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    public JwtAuthenticationFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    // [OPTIONAL] Giống stations-service: Bỏ qua filter cho các endpoint public
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/actuator") || path.startsWith("/swagger") || path.startsWith("/v3/api-docs");
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

                // 2. [QUAN TRỌNG] Lấy role theo đúng logic của stations-service
                String role = claims.getBody().get("role", String.class);

                if (role != null) {
                    // Chuẩn hóa role: Chuyển thành chữ hoa (ví dụ: "admin" -> "ADMIN")
                    role = role.toUpperCase();

                    // Xử lý tiền tố ROLE_ để đảm bảo chuẩn Spring Security
                    // Nếu token là "ROLE_ADMIN" -> cắt thành "ADMIN" rồi cộng lại "ROLE_" -> "ROLE_ADMIN"
                    // Logic này hơi thừa nhưng an toàn để đồng bộ với code mẫu
                    if (role.startsWith("ROLE_")) {
                        role = role.substring(5);
                    }

                    // Tạo Authority: Luôn phải có prefix ROLE_
                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);

                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                    username,
                                    null,
                                    Collections.singletonList(authority) // Tạo list chứa 1 quyền
                            );

                    SecurityContextHolder.getContext().setAuthentication(auth);
                } else {
                    System.err.println("WARN: Token hợp lệ nhưng không tìm thấy claim 'role'");
                }

            } catch (Exception e) {
                // Log lỗi để debug
                System.err.println("Lỗi xác thực JWT: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}