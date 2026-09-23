package com.snapflow;

import com.snapflow.dto.request.ChangePasswordRequest;
import com.snapflow.dto.request.LoginRequest;
import com.snapflow.dto.request.RegisterRequest;
import com.snapflow.dto.response.AuthResponse;
import com.snapflow.entity.User;
import com.snapflow.enums.Role;
import com.snapflow.exception.BadRequestException;
import com.snapflow.exception.ConflictException;
import com.snapflow.repository.UserRepository;
import com.snapflow.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class AuthTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Registration succeeds and stores BCrypt hashed password")
    void testRegistrationSuccess() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Kasun Perera");
        request.setEmail("kasun@example.com");
        request.setPassword("Password@123");
        request.setPhone("0771234567");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("kasun@example.com", response.getEmail());
        assertEquals(Role.CUSTOMER, response.getRole());

        User user = userRepository.findByEmailIgnoreCase("kasun@example.com").orElseThrow();
        assertNotEquals("Password@123", user.getPassword());
        assertTrue(passwordEncoder.matches("Password@123", user.getPassword()));
        assertTrue(user.isActive());
    }

    @Test
    @DisplayName("Duplicate email registration throws ConflictException")
    void testDuplicateEmailRegistration() {
        RegisterRequest request1 = new RegisterRequest();
        request1.setFullName("Kasun Perera");
        request1.setEmail("kasun@example.com");
        request1.setPassword("Password@123");
        request1.setPhone("0771234567");
        authService.register(request1);

        RegisterRequest request2 = new RegisterRequest();
        request2.setFullName("Kasun P");
        request2.setEmail("KASUN@example.com"); // uppercase variant
        request2.setPassword("Password@123");
        request2.setPhone("0779999999");

        assertThrows(ConflictException.class, () -> authService.register(request2));
    }

    @Test
    @DisplayName("Login succeeds with valid credentials")
    void testLoginSuccess() {
        RegisterRequest reg = new RegisterRequest();
        reg.setFullName("Amal Silva");
        reg.setEmail("amal@example.com");
        reg.setPassword("Amal@2026");
        reg.setPhone("0712345678");
        authService.register(reg);

        LoginRequest login = new LoginRequest();
        login.setEmail("amal@example.com");
        login.setPassword("Amal@2026");

        AuthResponse response = authService.login(login);
        assertNotNull(response.getToken());
        assertEquals("amal@example.com", response.getEmail());
    }

    @Test
    @DisplayName("Login fails with invalid password")
    void testLoginInvalidPassword() {
        RegisterRequest reg = new RegisterRequest();
        reg.setFullName("Amal Silva");
        reg.setEmail("amal@example.com");
        reg.setPassword("Amal@2026");
        reg.setPhone("0712345678");
        authService.register(reg);

        LoginRequest login = new LoginRequest();
        login.setEmail("amal@example.com");
        login.setPassword("WrongPassword@123");

        assertThrows(BadCredentialsException.class, () -> authService.login(login));
    }

    @Test
    @DisplayName("Deactivated user cannot log in")
    void testDeactivatedUserLogin() {
        RegisterRequest reg = new RegisterRequest();
        reg.setFullName("Inactive User");
        reg.setEmail("inactive@example.com");
        reg.setPassword("Inactive@2026");
        reg.setPhone("0710000000");
        authService.register(reg);

        User user = userRepository.findByEmailIgnoreCase("inactive@example.com").orElseThrow();
        user.setActive(false);
        userRepository.save(user);

        LoginRequest login = new LoginRequest();
        login.setEmail("inactive@example.com");
        login.setPassword("Inactive@2026");
        assertThrows(org.springframework.security.core.AuthenticationException.class, () -> authService.login(login));
    }
}
