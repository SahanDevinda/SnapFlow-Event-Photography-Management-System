package com.snapflow.dto.request;

import com.snapflow.enums.ChangeRequestType;
import com.snapflow.enums.CrewRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class ChangeRequestCreateDto {
    private ChangeRequestType requestType = ChangeRequestType.GENERAL;

    // Crew request fields (used when requestType = ADDITIONAL_CREW)
    private CrewRole requestedCrewRole;
    private Integer quantity = 1;

    // General change request fields
    private Long proposedPackageId;
    private LocalDate proposedDate;
    private LocalTime proposedStartTime;
    @Size(max = 255, message = "Proposed venue cannot exceed 255 characters")
    private String proposedVenue;
    @Size(max = 20, message = "A change request cannot have more than 20 add-ons")
    private List<Long> proposedAddOnIds;

    @NotBlank(message = "Description of change request is required")
    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;
}
