package com.meson.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Rejects login attempts once an IP exceeds IpLoginRateLimiter's threshold, before the
 * request reaches AuthController/AuthService — cheapest possible point to stop it.
 *
 * IP source is request.getRemoteAddr() only. There's no reverse proxy configured
 * anywhere in this project, so trusting X-Forwarded-For here would let an attacker
 * set that header to a fresh value on every request and bypass this entirely. If a
 * proxy is ever added in front of this app, this needs a trusted-proxy allowlist
 * before it can safely read forwarded-for headers.
 */
@Component
@RequiredArgsConstructor
public class IpRateLimitFilter extends OncePerRequestFilter {

    private final IpLoginRateLimiter rateLimiter;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        if (isLoginRequest(request)) {
            String ip = request.getRemoteAddr();
            if (!rateLimiter.recordAttempt(ip)) {
                writeTooManyRequests(response, rateLimiter.retryAfterMinutes(ip));
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isLoginRequest(HttpServletRequest request) {
        return "POST".equalsIgnoreCase(request.getMethod())
                && "/api/auth/login".equals(request.getRequestURI());
    }

    private void writeTooManyRequests(HttpServletResponse response, long retryAfterMinutes) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("""
                {"status":429,"error":"Too Many Requests",\
                "message":"Shume tentativa hyrjeje nga kjo adres IP. Provoni perseri pas %d minutash.",\
                "retryAfterMinutes":%d}"""
                .formatted(retryAfterMinutes, retryAfterMinutes));
    }
}
