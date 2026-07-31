package com.meson.dto;

import lombok.Getter;

/** A one-time view of a newly created account's temp password - shown once in the bulk-import
 *  results screen so an admin can hand it to a student who can't access their email. */
@Getter
public class BulkImportCredential {
    private final String emri;
    private final String mbiemri;
    private final String email;
    private final String tempPassword;

    public BulkImportCredential(String emri, String mbiemri, String email, String tempPassword) {
        this.emri = emri;
        this.mbiemri = mbiemri;
        this.email = email;
        this.tempPassword = tempPassword;
    }
}
