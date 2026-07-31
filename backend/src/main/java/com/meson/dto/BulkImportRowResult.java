package com.meson.dto;

import lombok.Getter;

@Getter
public class BulkImportRowResult {
    private final BulkImportRowDTO row;
    private final boolean success;
    private final String errorMessage;
    private final Long userId;
    private final String tempPassword;

    private BulkImportRowResult(BulkImportRowDTO row, boolean success, String errorMessage, Long userId, String tempPassword) {
        this.row = row;
        this.success = success;
        this.errorMessage = errorMessage;
        this.userId = userId;
        this.tempPassword = tempPassword;
    }

    public static BulkImportRowResult success(BulkImportRowDTO row, Long userId, String tempPassword) {
        return new BulkImportRowResult(row, true, null, userId, tempPassword);
    }

    public static BulkImportRowResult failure(BulkImportRowDTO row, String errorMessage) {
        return new BulkImportRowResult(row, false, errorMessage, null, null);
    }

    /**
     * Account creation succeeded but the notification email didn't send. Marked as a
     * non-success (the admin still needs to act - get the student their temp password
     * some other way) but keeps userId and tempPassword populated, which is what
     * distinguishes this from a real creation failure ({@link #failure}, where both
     * are always null) and is exactly why the password still needs to be shown here.
     */
    public static BulkImportRowResult accountCreatedEmailFailed(BulkImportRowDTO row, Long userId, String tempPassword, String emailError) {
        return new BulkImportRowResult(row, false, "Llogaria u krijua, por emaili nuk u dergua: " + emailError, userId, tempPassword);
    }
}
