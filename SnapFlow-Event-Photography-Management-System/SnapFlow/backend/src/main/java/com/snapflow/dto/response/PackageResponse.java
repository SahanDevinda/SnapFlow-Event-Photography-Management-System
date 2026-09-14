package com.snapflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PackageResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer durationHours;
    private String features;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
