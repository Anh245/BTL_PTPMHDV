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
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    public JwtAuthenticationFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    // ĐÃ XÓA: method shouldNotFilter -> Để đảm bảo mọi request đều được check token nếu có

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

                // 2. Lấy Role
                String role = claims.getBody().get("role", String.class);

                if (role != null) {
                    role = role.toUpperCase();
                    if (role.startsWith("ROLE_")) {
                        role = role.substring(5);
                    }

                    // Gán quyền: ROLE_ADMIN hoặc ROLE_USER
                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);

                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                    username,
                                    null,
                                    Collections.singletonList(authority)
                            );

                    SecurityContextHolder.getContext().setAuthentication(auth);
                } else {
                    System.err.println("WARN: Token hợp lệ nhưng không tìm thấy claim 'role'");
                }

            } catch (Exception e) {
                // Token lỗi -> SecurityContext rỗng -> SecurityConfig sẽ chặn (401)
                System.err.println("Lỗi xác thực JWT: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}