package com.snapflow.service;

import com.snapflow.dto.response.UserResponse;
import com.snapflow.entity.User;
import com.snapflow.enums.Role;
import com.snapflow.exception.ResourceNotFoundException;
import com.snapflow.repository.UserRepository;
import com.snapflow.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;

    public UserResponse getCurrentUserProfile() {
        return toResponse(securityUtils.getCurrentUser());
    }

    public UserResponse getById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toResponse(user);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<UserResponse> getByRole(Role role) {
        return userRepository.findByRole(role).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<UserResponse> getCustomers() {
        return getByRole(Role.CUSTOMER);
    }

    public List<UserResponse> getPhotographers() {
        return userRepository.findByRoleAndIsActiveTrue(Role.PHOTOGRAPHER).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse updateProfile(String firstName, String lastName, String phone) {
        User user = securityUtils.getCurrentUser();
        if (firstName != null) user.setFirstName(firstName);
        if (lastName != null) user.setLastName(lastName);
        if (phone != null) user.setPhone(phone);
        user = userRepository.save(user);
        return toResponse(user);
    }

    @Transactional
    public void toggleActive(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setIsActive(!Boolean.TRUE.equals(user.getIsActive()));
        userRepository.save(user);
    }

    private UserResponse toResponse(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .email(u.getEmail())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .phone(u.getPhone())
                .role(u.getRole())
                .isActive(u.getIsActive())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
