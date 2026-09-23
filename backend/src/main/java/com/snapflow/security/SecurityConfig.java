package com.snapflow.security;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;
    private final JwtAuthenticationEntryPoint unauthorizedHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${snapflow.cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider();

        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());

        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {

        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .cors(Customizer.withDefaults())

                .csrf(AbstractHttpConfigurer::disable)

                .exceptionHandling(exception ->
                        exception.authenticationEntryPoint(
                                unauthorizedHandler
                        )
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        /*
                         * IMPORTANT
                         *
                         * Explicitly allow login/register.
                         * normalizeRequestPath() handles the /api
                         * context path correctly.
                         */
                        .requestMatchers(
                                this::isPublicAuthenticationRequest
                        )
                        .permitAll()

                        // Public Packages
                        .requestMatchers(
                                HttpMethod.GET,
                                "/packages",
                                "/packages/{id:\\d+}"
                        )
                        .permitAll()

                        // Public Add-ons
                        .requestMatchers(
                                HttpMethod.GET,
                                "/add-ons",
                                "/add-ons/{id:\\d+}"
                        )
                        .permitAll()

                        // Public availability check
                        .requestMatchers(
                                HttpMethod.POST,
                                "/bookings/check-availability"
                        )
                        .permitAll()

                        // Public photographer names
                        .requestMatchers(
                                HttpMethod.GET,
                                "/users/public/photographers"
                        )
                        .permitAll()

                        // Public gallery access
                        .requestMatchers(
                                HttpMethod.GET,
                                "/galleries/public/**"
                        )
                        .permitAll()

                        // Public feedback
                        .requestMatchers(
                                HttpMethod.POST,
                                "/feedback"
                        )
                        .permitAll()

                        // Public settings
                        .requestMatchers(
                                HttpMethod.GET,
                                "/settings/public/**"
                        )
                        .permitAll()

                        // Swagger
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        )
                        .permitAll()

                        // Everything else requires JWT
                        .anyRequest()
                        .authenticated()
                );

        http.authenticationProvider(
                authenticationProvider()
        );

        http.addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
        );

        return http.build();
    }

    /**
     * Login and registration must be accessible
     * before a JWT exists.
     */
    private boolean isPublicAuthenticationRequest(
            HttpServletRequest request
    ) {

        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            return false;
        }

        String path = normalizeRequestPath(request);

        return "/auth/login".equals(path)
                || "/auth/register".equals(path);
    }

    /**
     * requestURI contains /api because application.properties
     * uses:
     *
     * server.servlet.context-path=/api
     *
     * This removes the context path before comparing routes.
     */
    private String normalizeRequestPath(
            HttpServletRequest request
    ) {

        String requestUri = request.getRequestURI();
        String contextPath = request.getContextPath();

        if (contextPath != null
                && !contextPath.isBlank()
                && requestUri.startsWith(contextPath)) {

            return requestUri.substring(
                    contextPath.length()
            );
        }

        return requestUri;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        List<String> origins =
                Arrays.stream(
                                allowedOrigins.split(",")
                        )
                        .map(String::trim)
                        .filter(origin ->
                                !origin.isBlank()
                        )
                        .toList();

        configuration.setAllowedOrigins(origins);

        configuration.setAllowedMethods(
                Arrays.asList(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                Arrays.asList(
                        "Authorization",
                        "Content-Type",
                        "Accept",
                        "X-Requested-With",
                        "Origin"
                )
        );

        configuration.setExposedHeaders(
                Arrays.asList(
                        "Authorization",
                        "Content-Disposition"
                )
        );

        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}