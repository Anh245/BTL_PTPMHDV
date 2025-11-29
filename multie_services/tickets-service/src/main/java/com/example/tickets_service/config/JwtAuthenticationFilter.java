package com.example.tickets_service.config;

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
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    public JwtAuthenticationFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                Jws<Claims> claims = jwtUtils.validateAndParse(token);
                String username = claims.getBody().getSubject();

                // Logic lấy roles giống trains-service/stations-service
                Object rolesObject = claims.getBody().get("roles"); // hoặc "role" tùy bên Auth sinh ra
                List<SimpleGrantedAuthority> authorities = new ArrayList<>();

                if (rolesObject instanceof List<?>) {
                    ((List<?>) rolesObject).forEach(r -> authorities.add(new SimpleGrantedAuthority("ROLE_" + r.toString())));
                } else if (rolesObject instanceof String) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + rolesObject));
                }

                // Fallback nếu auth service trả về key "role" (single) thay vì "roles"
                String singleRole = claims.getBody().get("role", String.class);
                if (singleRole != null && authorities.isEmpty()) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + singleRole.toUpperCase()));
                }

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(username, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(auth);

            } catch (Exception e) {
                // Token lỗi hoặc hết hạn
                System.err.println("JWT Auth failed: " + e.getMessage());
            }
        }
        filterChain.doFilter(request, response);
    }
}
