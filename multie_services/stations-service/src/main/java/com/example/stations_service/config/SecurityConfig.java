    package com.example.stations_service.config;

    import org.springframework.context.annotation.Bean;
    import org.springframework.context.annotation.Configuration;
    import org.springframework.http.HttpMethod;
    import org.springframework.security.config.annotation.web.builders.HttpSecurity;
    import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
    import org.springframework.security.config.http.SessionCreationPolicy;
    import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
    import org.springframework.security.crypto.password.PasswordEncoder;
    import org.springframework.security.web.SecurityFilterChain;
    import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

    @Configuration
    @EnableWebSecurity
    public class SecurityConfig {

        private final JwtAuthFilter jwtAuthFilter;

        public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
            this.jwtAuthFilter = jwtAuthFilter;
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http
                    // Tắt CSRF vì API stateless (JWT)
                    .csrf(csrf -> csrf.disable())

                    // Stateless session, không dùng session mặc định
                    .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                    // Tắt login form và http basic mặc định
                    .formLogin(form -> form.disable())
                    .httpBasic(basic -> basic.disable())

                    // Quy tắc phân quyền
                    .authorizeHttpRequests(auth -> auth
                            .requestMatchers("/actuator/**").permitAll()
                            .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                            .requestMatchers("/api/auth/**").permitAll() // public login/register
                            .requestMatchers(HttpMethod.GET, "/api/stations/**").hasAnyRole("USER", "ADMIN")
                            .requestMatchers(HttpMethod.POST, "/api/stations/**").hasRole("ADMIN")
                            .requestMatchers(HttpMethod.PUT, "/api/stations/**").hasRole("ADMIN")
                            .anyRequest().authenticated()
                    );

            // Thêm filter JWT trước UsernamePasswordAuthenticationFilter
            http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

            return http.build();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
            return new BCryptPasswordEncoder();
        }
    }
