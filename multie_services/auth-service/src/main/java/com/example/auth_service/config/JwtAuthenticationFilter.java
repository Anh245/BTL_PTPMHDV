package com.example.auth_service.config;

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
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    public JwtAuthenticationFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Bỏ filter cho các endpoint public (không cần authentication)
        String path = request.getServletPath();
        return path.equals("/api/auth/signin") || 
               path.equals("/api/auth/signup") || 
               path.equals("/api/auth/refresh") ||
               path.equals("/api/auth/signout");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {

            String token = header.substring(7);

            try {
                Jws<Claims> claims = jwtUtils.validateAndParse(token);

                String username = claims.getBody().getSubject();
                Long userId = claims.getBody().get("userId", Long.class);
                String role = claims.getBody().get("role", String.class);

                // Tạo custom principal chứa cả username và userId
                JwtUserPrincipal principal = new JwtUserPrincipal(username, userId, role);

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                principal,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + role))
                        );

                SecurityContextHolder.getContext().setAuthentication(auth);

            } catch (Exception ignored) {
                // Token sai -> bỏ qua, request sẽ bị chặn ở layer Security
            }
        }

        filterChain.doFilter(request, response);
    }
}
