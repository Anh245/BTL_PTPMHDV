package com.example.auth_service.controller;

import com.example.auth_service.config.JwtUserPrincipal;
import com.example.auth_service.dto.SignInRequest;
import com.example.auth_service.dto.SignUpRequest;
import com.example.auth_service.dto.TokenResponse;
import com.example.auth_service.dto.UserResponse;
import com.example.auth_service.entity.User;
import com.example.auth_service.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignUpRequest req) {
        try {
            User u = authService.signup(req);
            return ResponseEntity.status(HttpStatus.CREATED).body("Tạo tài khoản thành công, id=" + u.getId());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi server");
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signin(@Valid @RequestBody SignInRequest req, HttpServletRequest request, HttpServletResponse response) {
        try {
            String accessToken = authService.signin(req, response);

            // create session
            request.getSession(true).setAttribute("username", req.getUsername());

            return ResponseEntity.ok(new TokenResponse(accessToken));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi server");
        }
    }

    @PostMapping("/signout")
    public ResponseEntity<?> signout(HttpServletRequest request, HttpServletResponse response) {
        // get cookie
        String refreshToken = getRefreshTokenFromCookies(request);
        authService.signout(refreshToken, response);
        // invalidate session
        Optional.ofNullable(request.getSession(false)).ifPresent(sess -> sess.invalidate());
        return ResponseEntity.ok("Signed out");
    }

    @GetMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request) {
        String refreshToken = getRefreshTokenFromCookies(request);
        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Không tìm thấy token trong cookie");
        }
        try {
            String newAccess = authService.refreshToken(refreshToken);
            return ResponseEntity.ok(new TokenResponse(newAccess));
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi server");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Chưa đăng nhập");
            }

            // Lấy userId từ JWT principal
            Object principal = authentication.getPrincipal();
            if (!(principal instanceof JwtUserPrincipal)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid authentication");
            }

            JwtUserPrincipal userPrincipal = (JwtUserPrincipal) principal;
            Long userId = userPrincipal.getUserId();

            User user = authService.getUserById(userId);
            
            UserResponse userResponse = UserResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .username(user.getUsername())
                    .firstname(user.getFirstname())
                    .lastname(user.getLastname())
                    .role(user.getRole())
                    .build();

            return ResponseEntity.ok(userResponse);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi server");
        }
    }

    @PatchMapping("/me")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody com.example.auth_service.dto.UpdateProfileRequest req) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Chưa đăng nhập");
            }

            Object principal = authentication.getPrincipal();
            if (!(principal instanceof JwtUserPrincipal)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid authentication");
            }

            JwtUserPrincipal userPrincipal = (JwtUserPrincipal) principal;
            Long userId = userPrincipal.getUserId();

            User updatedUser = authService.updateProfile(
                userId,
                req.getFirstname(),
                req.getLastname(),
                req.getEmail()
            );

            UserResponse userResponse = UserResponse.builder()
                    .id(updatedUser.getId())
                    .email(updatedUser.getEmail())
                    .username(updatedUser.getUsername())
                    .firstname(updatedUser.getFirstname())
                    .lastname(updatedUser.getLastname())
                    .role(updatedUser.getRole())
                    .build();

            return ResponseEntity.ok(userResponse);
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi server");
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody com.example.auth_service.dto.ChangePasswordRequest req) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Chưa đăng nhập");
            }

            Object principal = authentication.getPrincipal();
            if (!(principal instanceof JwtUserPrincipal)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid authentication");
            }

            JwtUserPrincipal userPrincipal = (JwtUserPrincipal) principal;
            Long userId = userPrincipal.getUserId();

            authService.changePassword(userId, req.getCurrentPassword(), req.getNewPassword());

            return ResponseEntity.ok("Đổi mật khẩu thành công");
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi server");
        }
    }

    private String getRefreshTokenFromCookies(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(c -> "refreshToken".equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst().orElse(null);
    }
}
