package com.example.auth_service.service;

import com.example.auth_service.config.JwtUtils;
import com.example.auth_service.dto.SignInRequest;
import com.example.auth_service.dto.SignUpRequest;
import com.example.auth_service.entity.RefreshToken;
import com.example.auth_service.entity.Role;
import com.example.auth_service.entity.User;
import com.example.auth_service.repository.RefreshTokenRepository;
import com.example.auth_service.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final long refreshTokenDurationMs;

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       JwtUtils jwtUtils,
                       @Value("${app.jwt.refreshTokenExpirationMs}") long refreshTokenDurationMs) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
        this.jwtUtils = jwtUtils;
        this.refreshTokenDurationMs = refreshTokenDurationMs;
    }

    @Transactional
    public User signup(SignUpRequest req) {
        if (req.getEmail() == null || req.getUsername() == null || req.getPassword() == null) {
            throw new IllegalArgumentException("Thiếu input");
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalStateException("Email đã tồn tại");
        }
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new IllegalStateException("Username đã tồn tại");
        }

        String hashed = passwordEncoder.encode(req.getPassword());
        Role role = Role.USER;
        if (req.getRole() != null) {
            try {
                role = Role.valueOf(req.getRole().toUpperCase());
            } catch (Exception ignored) {}
        }

        User u = User.builder()
                .email(req.getEmail())
                .username(req.getUsername())
                .password(hashed)
                .firstname(req.getFirstname())
                .lastname(req.getLastname())
                .role(role)
                .build();

        return userRepository.save(u);
    }

    public String signin(SignInRequest req, HttpServletResponse response) {
        if (req.getUsername() == null || req.getPassword() == null) {
            throw new IllegalArgumentException("Thiếu input");
        }

        User user = userRepository.findByUsername(req.getUsername())
                .orElseThrow(() -> new SecurityException("username/password không đúng"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new SecurityException("username/password không đúng");
        }

        // create session (HTTP session) - handled by controller if needed
        // create access token
        String accessToken = jwtUtils.generateAccessToken(user.getUsername(), user.getId(), user.getRole().name());

        // create refresh token (store in DB)
        String refreshTokenStr = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
                .token(refreshTokenStr)
                .user(user)
                .expiryDate(Instant.now().plusMillis(refreshTokenDurationMs))
                .build();
        refreshTokenRepository.save(refreshToken);

        // set cookie (HttpOnly)
        Cookie cookie = new Cookie("refreshToken", refreshTokenStr);
        cookie.setHttpOnly(true);
        cookie.setMaxAge((int) (refreshTokenDurationMs / 1000));
        cookie.setPath("/"); // Allow cookie for all paths
        cookie.setSecure(false); // Set to true in production with HTTPS
        response.addCookie(cookie);
        // Add SameSite attribute via header (Cookie class doesn't support it directly)
        response.addHeader("Set-Cookie", String.format(
            "refreshToken=%s; Path=/; Max-Age=%d; HttpOnly; SameSite=Lax",
            refreshTokenStr, (int) (refreshTokenDurationMs / 1000)
        ));

        return accessToken;
    }

    public void signout(String refreshTokenFromCookie, HttpServletResponse response) {
        if (refreshTokenFromCookie != null) {
            refreshTokenRepository.findByToken(refreshTokenFromCookie).ifPresent(rt -> {
                refreshTokenRepository.delete(rt);
            });
        }
        Cookie cookie = new Cookie("refreshToken", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        // Clear cookie with SameSite attribute
        response.addHeader("Set-Cookie", "refreshToken=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
    }

    public String refreshToken(String refreshTokenStr) {
        if (refreshTokenStr == null) {
            throw new SecurityException("No token found");
        }
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenStr)
                .orElseThrow(() -> new SecurityException("Token không hợp lệ"));

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new SecurityException("Refresh token hết hạn");
        }

        User user = refreshToken.getUser();
        return jwtUtils.generateAccessToken(user.getUsername(), user.getId(), user.getRole().name());
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user với id: " + userId));
    }
}
