package com.snapflow.util;

import com.snapflow.entity.User;
import com.snapflow.enums.Role;
import com.snapflow.exception.UnauthorizedException;
import com.snapflow.repository.UserRepository;
import com.snapflow.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UserRepository userRepository;

    public UserPrincipal getCurrentPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof UserPrincipal)) {
            throw new UnauthorizedException("User is not authenticated");
        }
        return (UserPrincipal) auth.getPrincipal();
    }

    public User getCurrentUser() {
        UserPrincipal principal = getCurrentPrincipal();
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new UnauthorizedException("Authenticated user not found"));
    }

    public Long getCurrentUserId() {
        return getCurrentPrincipal().getId();
    }

    public boolean hasRole(Role role) {
        return getCurrentPrincipal().getRole() == role;
    }
}
