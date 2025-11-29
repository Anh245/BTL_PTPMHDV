    package com.example.stations_service.config;

    import io.jsonwebtoken.Claims;
    import io.jsonwebtoken.Jws;
    import jakarta.servlet.FilterChain;
    import jakarta.servlet.ServletException;
    import jakarta.servlet.http.HttpServletRequest;
    import jakarta.servlet.http.HttpServletResponse;
    import lombok.extern.slf4j.Slf4j; // Nếu bạn dùng Lombok, hoặc dùng System.out
    import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
    import org.springframework.security.core.authority.SimpleGrantedAuthority;
    import org.springframework.security.core.context.SecurityContextHolder;
    import org.springframework.stereotype.Component;
    import org.springframework.web.filter.OncePerRequestFilter;

    import java.io.IOException;
    import java.util.List;

    @Component
    public class JwtAuthFilter extends OncePerRequestFilter {

        private final JwtUtils jwtUtils;

        public JwtAuthFilter(JwtUtils jwtUtils) {
            this.jwtUtils = jwtUtils;
        }

        @Override
        protected boolean shouldNotFilter(HttpServletRequest request) {
            String path = request.getServletPath();
            // Bỏ qua các endpoint public để tăng tốc độ
            return path.startsWith("/api/auth/") || path.startsWith("/actuator") || path.startsWith("/swagger");
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
                    // 1. Giải mã Token
                    Jws<Claims> claims = jwtUtils.validateAndParse(token);

                    String username = claims.getBody().getSubject();
                    // Lấy role từ token (có thể là null)
                    String role = claims.getBody().get("role", String.class);

                    if (role != null) {
                        // 2. CHUẨN HÓA ROLE: Chuyển thành chữ hoa để khớp với SecurityConfig
                        role = role.toUpperCase();

                        // Xử lý trường hợp token đã có sẵn tiền tố ROLE_
                        if (role.startsWith("ROLE_")) {
                            role = role.substring(5);
                        }

                        // Tạo quyền (Authority) chuẩn: ROLE_ADMIN
                        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);

                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(
                                        username,
                                        null,
                                        List.of(authority)
                                );

                        SecurityContextHolder.getContext().setAuthentication(auth);
                        // System.out.println("Auth success for user: " + username + " with role: " + role);
                    } else {
                        System.err.println("Token hợp lệ nhưng không tìm thấy claim 'role'");
                    }

                } catch (Exception e) {
                    // 3. QUAN TRỌNG: In lỗi ra console để biết tại sao tạch
                    System.err.println("Lỗi xác thực JWT: " + e.getMessage());
                    // e.printStackTrace(); // Bật dòng này nếu cần xem chi tiết
                }
            }

            filterChain.doFilter(request, response);
        }
    }