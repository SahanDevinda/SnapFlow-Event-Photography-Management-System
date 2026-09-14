package com.snapflow.dto.response;

import com.snapflow.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private Role role;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
