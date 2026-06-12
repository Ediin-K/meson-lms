// Extracts the user-readable message the backend sent (GlobalExceptionHandler
// returns { status, error, message }), falling back to a generic string.
export function apiMessage(err, fallback) {
    const data = err?.response?.data
    if (typeof data?.message === 'string' && data.message.trim()) return data.message
    if (typeof data === 'string' && data.trim()) return data
    return fallback
}
