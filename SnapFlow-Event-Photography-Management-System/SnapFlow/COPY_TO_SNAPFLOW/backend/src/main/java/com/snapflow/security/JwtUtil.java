package com.snapflow.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    // =========================================================
    // Get Signing Key
    // =========================================================
    private SecretKey getSigningKey() {

        byte[] keyBytes;

        try {
            keyBytes = Decoders.BASE64.decode(secret);
        } catch (Exception e) {
            keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        }

        return Keys.hmacShaKeyFor(keyBytes);
    }

    // =========================================================
    // Generate Token - Username only
    // =========================================================
    public String generateToken(String username) {

        Map<String, Object> claims = new HashMap<>();

        return createToken(claims, username);
    }

    // =========================================================
    // Generate Token - Username + Role
    // =========================================================
    public String generateToken(String username, String role) {

        Map<String, Object> claims = new HashMap<>();

        claims.put("role", role);

        return createToken(claims, username);
    }

    // =========================================================
    // Create Token
    // =========================================================
    private String createToken(
            Map<String, Object> claims,
            String subject) {

        Date now = new Date();

        Date expirationDate =
                new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(now)
                .expiration(expirationDate)
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    // =========================================================
    // Extract Username
    // =========================================================
    public String extractUsername(String token) {

        return extractClaim(
                token,
                Claims::getSubject
        );
    }

    // =========================================================
    // Extract Role
    // =========================================================
    public String extractRole(String token) {

        return extractClaim(
                token,
                claims -> claims.get("role", String.class)
        );
    }

    // =========================================================
    // Extract Expiration
    // =========================================================
    public Date extractExpiration(String token) {

        return extractClaim(
                token,
                Claims::getExpiration
        );
    }

    // =========================================================
    // Extract Any Claim
    // =========================================================
    public <T> T extractClaim(
            String token,
            Function<Claims, T> claimsResolver) {

        Claims claims = extractAllClaims(token);

        return claimsResolver.apply(claims);
    }

    // =========================================================
    // Extract All Claims
    // =========================================================
    private Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // =========================================================
    // Check Expiration
    // =========================================================
    private boolean isTokenExpired(String token) {

        return extractExpiration(token)
                .before(new Date());
    }

    // =========================================================
    // Validate Token - ONLY TOKEN
    // This fixes:
    // validateToken(String)
    // =========================================================
    public boolean validateToken(String token) {

        try {

            extractAllClaims(token);

            return !isTokenExpired(token);

        } catch (Exception e) {

            return false;
        }
    }

    // =========================================================
    // Validate Token - TOKEN + USERNAME
    // =========================================================
    public boolean validateToken(
            String token,
            String username) {

        try {

            String extractedUsername =
                    extractUsername(token);

            return extractedUsername != null
                    && extractedUsername.equals(username)
                    && !isTokenExpired(token);

        } catch (Exception e) {

            return false;
        }
    }

    // =========================================================
    // Validate Token - TOKEN + USERNAME + ROLE
    // =========================================================
    public boolean validateToken(
            String token,
            String username,
            String role) {

        try {

            String extractedUsername =
                    extractUsername(token);

            String extractedRole =
                    extractRole(token);

            return extractedUsername != null
                    && extractedUsername.equals(username)
                    && extractedRole != null
                    && extractedRole.equals(role)
                    && !isTokenExpired(token);

        } catch (Exception e) {

            return false;
        }
    }
}