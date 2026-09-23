package com.snapflow.service;

import com.snapflow.dto.request.ProfileUpdateRequest;
import com.snapflow.dto.request.UserCreateRequest;
import com.snapflow.dto.request.UserUpdateRequest;
import com.snapflow.dto.response.PublicPhotographerResponse;
import com.snapflow.dto.response.UserResponse;
import com.snapflow.entity.User;
import com.snapflow.enums.Role;
import com.snapflow.exception.BadRequestException;
import com.snapflow.exception.ConflictException;
import com.snapflow.exception.ResourceNotFoundException;
import com.snapflow.repository.UserRepository;
import com.snapflow.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtils securityUtils;
    private final AuditService auditService;

    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Email already exists: " + email);
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .role(request.getRole())
                .active(true)
                .build();

        User saved = userRepository.save(user);
        auditService.log("USER_CREATE", "Created user " + saved.getEmail() + " with role " + saved.getRole());
        return mapToUserResponse(saved);
    }

    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        // Self-protection: Prevent company director from accidentally deactivating or demoting their own only active admin account
        User currentUser = securityUtils.getCurrentUser();
        if (user.getId().equals(currentUser.getId()) && user.getRole() == Role.COMPANY_DIRECTOR) {
            if (request.getActive() != null && !request.getActive()) {
                throw new BadRequestException("You cannot deactivate your own Company Director account");
            }
            if (request.getRole() != null && request.getRole() != Role.COMPANY_DIRECTOR) {
                long activeDirectors = userRepository.countByRoleAndActiveTrue(Role.COMPANY_DIRECTOR);
                if (activeDirectors <= 1) {
                    throw new BadRequestException("Cannot change role. At least one active Company Director must exist.");
                }
            }
        }

        user.setFullName(request.getFullName().trim());
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }

        User updated = userRepository.save(user);
        auditService.log("USER_UPDATE", "Updated user " + updated.getEmail());
        return mapToUserResponse(updated);
    }

    /**
     * Self-service profile update for the currently authenticated user.
     * Role and active flag are deliberately NOT editable here - only a
     * Company Director may change those via updateUser(...).
     */
    @Transactional
    public UserResponse updateOwnProfile(ProfileUpdateRequest request) {
        User user = securityUtils.getCurrentUser();

        user.setFullName(request.getFullName().trim());
        if (request.getPhone() != null) {
            String phone = request.getPhone().trim();
            user.setPhone(phone.isEmpty() ? null : phone);
        }

        User updated = userRepository.save(user);
        auditService.log("PROFILE_UPDATE", "User " + updated.getEmail() + " updated their own profile");
        return mapToUserResponse(updated);
    }

    @Transactional
    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        User currentUser = securityUtils.getCurrentUser();
        if (user.getId().equals(currentUser.getId())) {
            throw new BadRequestException("You cannot deactivate your own account");
        }

        if (user.getRole() == Role.COMPANY_DIRECTOR) {
            long activeDirectors = userRepository.countByRoleAndActiveTrue(Role.COMPANY_DIRECTOR);
            if (activeDirectors <= 1) {
                throw new BadRequestException("Cannot deactivate the only active Company Director account");
            }
        }

        user.setActive(false);
        userRepository.save(user);
        auditService.log("USER_DEACTIVATE", "Deactivated user " + user.getEmail());
    }

    @Transactional
    public void reactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setActive(true);
        userRepository.save(user);
        auditService.log("USER_REACTIVATE", "Reactivated user " + user.getEmail());
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return mapToUserResponse(user);
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> searchUsers(Role role, Boolean active, String search, Pageable pageable) {
        return userRepository.searchUsers(role, active, search, pageable)
                .map(UserService::mapToUserResponse);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getActivePhotographers() {
        return userRepository.findByRoleAndActiveTrue(Role.PHOTOGRAPHER)
                .stream()
                .map(UserService::mapToUserResponse)
                .toList();
    }

    /** Name-only directory for the anonymous availability page. */
    @Transactional(readOnly = true)
    public List<PublicPhotographerResponse> getPublicPhotographers() {
        return userRepository.findByRoleAndActiveTrue(Role.PHOTOGRAPHER)
                .stream()
                .map(u -> PublicPhotographerResponse.builder()
                        .id(u.getId())
                        .fullName(u.getFullName())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getActiveCustomers() {
        return userRepository.findByRoleAndActiveTrue(Role.CUSTOMER)
                .stream()
                .map(UserService::mapToUserResponse)
                .toList();
    }

    public static UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
