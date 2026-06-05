package com.meson.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkDepartmentGroupsRequest {
    @NotNull
    @Min(1)
    @Max(12)
    private Integer semester;

    @NotEmpty
    @Valid
    private List<DepartmentGroupRequest> groups;
}
