package com.meson.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Per-IP fixed-window attempt counter for the login endpoint. Independent of
 * AuthService's per-account lockout: caps how many login attempts one IP can make
 * regardless of which account it's targeting, which per-account lockout alone doesn't
 * catch since credential stuffing spreads attempts across many accounts.
 */
@Component
public class IpLoginRateLimiter {

    @Value("${rate-limit.login.max-attempts:20}")
    private int maxAttempts;

    @Value("${rate-limit.login.window-minutes:15}")
    private long windowMinutes;

    private final Map<String, Window> windowsByIp = new ConcurrentHashMap<>();

    /** Records one attempt from this IP; returns whether it's still within the allowed rate. */
    public boolean recordAttempt(String ip) {
        sweepExpiredOccasionally();
        Window window = windowsByIp.compute(ip, (key, existing) -> {
            Instant now = Instant.now();
            if (existing == null || existing.expiresAt.isBefore(now)) {
                return new Window(now.plus(Duration.ofMinutes(windowMinutes)));
            }
            return existing;
        });
        return window.count.incrementAndGet() <= maxAttempts;
    }

    /** Minutes until this IP's current window resets, for a retry-after message. */
    public long retryAfterMinutes(String ip) {
        Window window = windowsByIp.get(ip);
        if (window == null) {
            return 0;
        }
        long secondsLeft = Duration.between(Instant.now(), window.expiresAt).getSeconds();
        return Math.max(1, (secondsLeft + 59) / 60);
    }

    /**
     * No scheduled job backs this map, so without some cleanup it grows forever as
     * distinct IPs show up (worse under IPv6 or a rotating-IP attacker). A 1%-per-call
     * sweep keeps it bounded without adding a scheduler for something this cheap.
     */
    private void sweepExpiredOccasionally() {
        if (ThreadLocalRandom.current().nextInt(100) != 0) {
            return;
        }
        Instant now = Instant.now();
        windowsByIp.values().removeIf(window -> window.expiresAt.isBefore(now));
    }

    private static final class Window {
        final Instant expiresAt;
        final AtomicInteger count = new AtomicInteger(0);

        Window(Instant expiresAt) {
            this.expiresAt = expiresAt;
        }
    }
}
