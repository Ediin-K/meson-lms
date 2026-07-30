package com.meson.dto;

import lombok.Getter;

import java.util.List;

@Getter
public class BulkImportResponse {
    private final int totalRows;
    private final int successCount;
    private final int failureCount;
    private final List<BulkImportRowResult> failures;

    public BulkImportResponse(int totalRows, int successCount, int failureCount,
                               List<BulkImportRowResult> failures) {
        this.totalRows = totalRows;
        this.successCount = successCount;
        this.failureCount = failureCount;
        this.failures = failures;
    }
}
