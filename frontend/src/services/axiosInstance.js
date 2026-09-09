import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

/** Dispatched when the access token expired and the refresh attempt also failed. */
export const SESSION_EXPIRED_EVENT = 'meson:session-expired'

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
})

/**
 * Single-flight the token refresh. A page load fires several requests at once; if
 * the access token has expired they all 401 together. The refresh token is
 * single-use and rotates on every call, so without this the first refresh wins
 * and the rest fail on the now-revoked token — spuriously firing "session
 * expired" while the session is actually fine. All concurrent 401s share one
 * refresh call and then retry.
 */
let refreshPromise = null

function refreshSession() {
    if (!refreshPromise) {
        refreshPromise = axios
            .post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
            .finally(() => { refreshPromise = null })
    }
    return refreshPromise
}

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                await refreshSession()
                // A 401 is rejected before the controller runs, so the original
                // request never executed — retrying it (GET or mutation) is safe.
                return axiosInstance(originalRequest)
            } catch {
                // Don't hard-redirect: forms may hold unsaved input. Let the
                // app show a re-login prompt instead.
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT))
                }
            }
        }

        return Promise.reject(error)
    }
)

export default axiosInstance
