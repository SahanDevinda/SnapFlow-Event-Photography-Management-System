package com.snapflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Minimal, anonymously-readable view of a photographer.
 *
 * The public availability page only needs a name to populate its dropdown, so
 * this deliberately omits the email and phone number carried by UserResponse.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicPhotographerResponse {
    private Long id;
    private String fullName;
}
