package com.snapflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SystemSettingRequest {
    @NotBlank(message = "Setting key is required")
    @Size(max = 50, message = "Setting key cannot exceed 50 characters")
    private String settingKey;

    @NotBlank(message = "Setting value is required")
    private String settingValue;

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    private String description;
}
