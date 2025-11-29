package com.example.auth_service.repository;

import com.example.auth_service.entity.RefreshToken;
import com.example.auth_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    int deleteByUser(User user);
    void deleteByToken(String token);
}
