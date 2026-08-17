package com.meson.exception;

import lombok.extern.slf4j.Slf4j;
import org.hibernate.LazyInitializationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        return error(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoResourceFound(NoResourceFoundException ex) {
        return error(HttpStatus.NOT_FOUND, "Rruga e kerkuar nuk u gjet");
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(BadRequestException ex) {
        return error(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(AccountLockedException.class)
    public ResponseEntity<Map<String, Object>> handleAccountLocked(AccountLockedException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", HttpStatus.LOCKED.value());
        body.put("error", HttpStatus.LOCKED.getReasonPhrase());
        body.put("message", ex.getMessage());
        body.put("retryAfterMinutes", ex.getRetryAfterMinutes());
        return ResponseEntity.status(HttpStatus.LOCKED).body(body);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return error(HttpStatus.BAD_REQUEST, "Parametri '" + ex.getName() + "' eshte i pavlefshem.");
    }

    @ExceptionHandler({IllegalArgumentException.class, MethodArgumentNotValidException.class})
    public ResponseEntity<Map<String, Object>> handleValidation(Exception ex) {
        String message = ex instanceof MethodArgumentNotValidException m
                ? m.getBindingResult().getFieldErrors().stream()
                        .findFirst()
                        .map(err -> err.getField() + ": " + err.getDefaultMessage())
                        .orElse("Kerkesa eshte e pavlefshme")
                : ex.getMessage();
        return error(HttpStatus.BAD_REQUEST, message);
    }

    @ExceptionHandler(org.springframework.web.multipart.MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleMaxUpload(
            org.springframework.web.multipart.MaxUploadSizeExceededException ex) {
        return error(HttpStatus.PAYLOAD_TOO_LARGE,
                "Skedari eshte shume i madh. Madhesia maksimale e lejuar eshte 20 MB.");
    }

    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<Map<String, Object>> handleNullPointer(NullPointerException ex) {
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "Gabim i brendshem: te dhena mungojne");
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        return error(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntime(RuntimeException ex) {
        return error(HttpStatus.BAD_REQUEST, ex.getMessage() != null ? ex.getMessage() : "Kerkesa deshtoi");
    }

    @ExceptionHandler(LazyInitializationException.class)
    public ResponseEntity<Map<String, Object>> handleLazyInit(LazyInitializationException ex) {
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "Gabim i brendshem: te dhenat nuk u ngarkuan plotesisht");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {
        log.error("Unhandled exception", ex);
        return error(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Gabim i papritur ne server. Kontaktoni administratorin.");
    }

    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
}
