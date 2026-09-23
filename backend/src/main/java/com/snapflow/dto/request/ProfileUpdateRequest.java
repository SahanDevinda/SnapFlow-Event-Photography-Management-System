package com.snapflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Payload for PUT /users/me.
 *
 * Deliberately narrower than {@link UserUpdateRequest}: a user may change their
 * own name and phone number, but never their role or active status.
 */
@Data
public class ProfileUpdateRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 120, message = "Full name cannot exceed 120 characters")
    private String fullName;

    @Pattern(regexp = "^[0-9+\\-\\s()]{7,20}$", message = "Enter a valid phone number")
    @Size(max = 20, message = "Phone number cannot exceed 20 characters")
    private String phone;
}
