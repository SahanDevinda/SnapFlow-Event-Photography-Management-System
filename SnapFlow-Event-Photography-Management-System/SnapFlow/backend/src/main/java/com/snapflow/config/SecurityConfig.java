package com.snapflow.config;

import com.snapflow.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;

import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.core.userdetails.UserDetailsService;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    // =========================================================
    // Security Filter Chain
    // =========================================================
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

                // -------------------------------------------------
                // CSRF
                // -------------------------------------------------
                .csrf(AbstractHttpConfigurer::disable)

                // -------------------------------------------------
                // CORS
                // -------------------------------------------------
                .cors(cors ->
                        cors.configurationSource(corsConfigurationSource())
                )

                // -------------------------------------------------
                // Stateless Session
                // -------------------------------------------------
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // -------------------------------------------------
                // Authorization
                // -------------------------------------------------
                .authorizeHttpRequests(auth -> auth

                        // =================================================
                        // PUBLIC
                        // =================================================

                        // Root / error
                        .requestMatchers("/").permitAll()
                        .requestMatchers("/error").permitAll()

                        // Authentication
                        .requestMatchers("/api/auth/**").permitAll()

                        // Public package/addon viewing
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/packages/**"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/addons/**"
                        ).permitAll()

                        // Uploaded files
                        .requestMatchers("/uploads/**").permitAll()

                        // OPTIONS for CORS
                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        // =================================================
                        // ADMIN / COMPANY DIRECTOR
                        // =================================================

                        .requestMatchers("/api/admin/**")
                        .hasRole("COMPANY_DIRECTOR")

                        // =================================================
                        // DASHBOARD
                        // =================================================

                        .requestMatchers("/api/dashboard/**")
                        .hasAnyRole(
                                "COMPANY_DIRECTOR",
                                "OPERATIONS_MANAGER",
                                "FINANCE_EXECUTIVE"
                        )

                        // =================================================
                        // FINANCE
                        // =================================================

                        .requestMatchers("/api/finance/**")
                        .hasAnyRole(
                                "FINANCE_EXECUTIVE",
                                "COMPANY_DIRECTOR"
                        )

                        // =================================================
                        // OPERATIONS
                        // =================================================

                        .requestMatchers("/api/operations/**")
                        .hasAnyRole(
                                "OPERATIONS_MANAGER",
                                "COMPANY_DIRECTOR"
                        )

                        // =================================================
                        // PHOTOGRAPHER
                        // =================================================

                        .requestMatchers("/api/photographer/**")
                        .hasRole("PHOTOGRAPHER")

                        // =================================================
                        // EVERYTHING ELSE
                        // =================================================

                        .anyRequest().authenticated()
                )

                // -------------------------------------------------
                // Authentication Provider
                // -------------------------------------------------
                .authenticationProvider(authenticationProvider())

                // -------------------------------------------------
                // JWT Filter
                // -------------------------------------------------
                .addFilterBefore(
                        jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    // =========================================================
    // CORS Configuration
    // =========================================================
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(
                List.of(
                        "http://localhost:5173",
                        "http://localhost:3000"
                )
        );

        config.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        config.setAllowedHeaders(
                List.of("*")
        );

        config.setAllowCredentials(true);

        config.setExposedHeaders(
                List.of("Authorization")
        );

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                config
        );

        return source;
    }

    // =========================================================
    // Authentication Provider
    // =========================================================
    @Bean
    public AuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider();

        provider.setUserDetailsService(
                userDetailsService
        );

        provider.setPasswordEncoder(
                passwordEncoder()
        );

        return provider;
    }

    // =========================================================
    // Authentication Manager
    // =========================================================
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config)
            throws Exception {

        return config.getAuthenticationManager();
    }

    // =========================================================
    // Password Encoder
    // =========================================================
    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }
}