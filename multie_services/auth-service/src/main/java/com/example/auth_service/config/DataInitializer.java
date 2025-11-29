package com.example.auth_service.config;

import com.example.auth_service.entity.Role;
import com.example.auth_service.entity.User;
import com.example.auth_service.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initAdmin(UserRepository userRepository) {
        return args -> {
            // Kiểm tra nếu chưa có admin
            if (!userRepository.existsByUsername("admin")) {
                BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
                User admin = User.builder()
                        .username("admin")
                        .email("admin@example.com")
                        .password(encoder.encode("admin123")) // password mặc định
                        .role(Role.ADMIN)
                        .firstname("System")
                        .lastname("Admin")
                        .build();
                userRepository.save(admin);
                System.out.println("Admin user created: username=admin, password=admin123");
            }
        };
    }
}
