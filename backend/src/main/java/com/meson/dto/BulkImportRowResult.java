package com.meson.dto;

import lombok.Getter;

@Getter
public class BulkImportRowResult {
    private final BulkImportRowDTO row;
    private final boolean success;
    private final String errorMessage;
    private final Long userId;

    private BulkImportRowResult(BulkImportRowDTO row, boolean success, String errorMessage, Long userId) {
        this.row = row;
        this.success = success;
        this.errorMessage = errorMessage;
        this.userId = userId;
    }

    public static BulkImportRowResult success(BulkImportRowDTO row, Long userId) {
        return new BulkImportRowResult(row, true, null, userId);
    }

    public static BulkImportRowResult failure(BulkImportRowDTO row, String errorMessage) {
        return new BulkImportRowResult(row, false, errorMessage, null);
    }
}
