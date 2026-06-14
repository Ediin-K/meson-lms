import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

/** Dispatched when the access token expired and the refresh attempt also failed. */
export const SESSION_EXPIRED_EVENT = 'meson:session-expired'

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
})

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                await axios.post(
                    `${API_BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                )

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
