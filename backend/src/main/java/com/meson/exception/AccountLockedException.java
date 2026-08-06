package com.meson.exception;

/** Thrown when a login is rejected because the account is currently locked out. */
public class AccountLockedException extends RuntimeException {

    private final long retryAfterMinutes;

    public AccountLockedException(String message, long retryAfterMinutes) {
        super(message);
        this.retryAfterMinutes = retryAfterMinutes;
    }

    public long getRetryAfterMinutes() {
        return retryAfterMinutes;
    }
}
