package com.snapflow.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret",
                "SnapFlowSecretKeyForJWTTokenGenerationMustBeLongEnough2024UniversityProject");
        ReflectionTestUtils.setField(jwtUtil, "expirationMs", 86400000L);
    }

    @Test
    void generateAndValidateToken() {
        String token = jwtUtil.generateToken("test@email.com", "CUSTOMER");
        assertNotNull(token);
        assertTrue(jwtUtil.validateToken(token));
        assertEquals("test@email.com", jwtUtil.extractUsername(token));
        assertEquals("CUSTOMER", jwtUtil.extractRole(token));
    }

    @Test
    void invalidTokenFails() {
        assertFalse(jwtUtil.validateToken("invalid.token.here"));
    }
}
