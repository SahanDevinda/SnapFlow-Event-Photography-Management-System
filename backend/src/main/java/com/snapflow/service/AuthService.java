package com.snapflow.service;

import com.snapflow.dto.request.ChangePasswordRequest;
import com.snapflow.dto.request.LoginRequest;
import com.snapflow.dto.request.RegisterRequest;
import com.snapflow.dto.response.AuthResponse;
import com.snapflow.dto.response.UserResponse;
import com.snapflow.entity.User;
import com.snapflow.enums.Role;
import com.snapflow.exception.BadRequestException;
import com.snapflow.exception.ConflictException;
import com.snapflow.repository.UserRepository;
import com.snapflow.security.JwtTokenProvider;
import com.snapflow.security.UserPrincipal;
import com.snapflow.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final SecurityUtils securityUtils;
    private final AuditService auditService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Email is already registered: " + email);
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone().trim())
                .role(Role.CUSTOMER)
                .active(true)
                .build();

        User savedUser = userRepository.save(user);
        auditService.log("USER_REGISTER", "Customer registered: " + savedUser.getEmail());

        String token = tokenProvider.generateTokenFromEmailAndRole(savedUser.getEmail(), savedUser.getRole().name(), savedUser.getId());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(savedUser.getId())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        if (!principal.isActive()) {
            throw new BadRequestException("Account is deactivated. Please contact administration.");
        }

        String token = tokenProvider.generateToken(authentication);

        auditService.log("USER_LOGIN", "User logged in: " + principal.getEmail());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(principal.getId())
                .fullName(principal.getFullName())
                .email(principal.getEmail())
                .role(principal.getRole())
                .build();
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = securityUtils.getCurrentUser();

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }

        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new BadRequestException("New password cannot be the same as current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditService.log("PASSWORD_CHANGE", "Password changed for: " + user.getEmail());
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUserResponse() {
        User user = securityUtils.getCurrentUser();
        return UserService.mapToUserResponse(user);
    }
}
