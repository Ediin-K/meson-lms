import axiosInstance from './axiosInstance'

const API_URL = 'http://localhost:8080/api/auth';

const ROLE_PRIORITY = ['admin', 'department_head', 'teacher', 'student'];

/** Persist the role set from an auth response so a page reload restores it. */
function persistRoles(data) {
    const roles = (data.roles?.length ? data.roles : [data.role])
        .map((r) => String(r || '').toLowerCase())
        .filter(Boolean);
    const primary = ROLE_PRIORITY.find((r) => roles.includes(r)) || roles[0] || 'guest';
    try {
        localStorage.setItem('meson-roles', JSON.stringify(roles.length ? roles : ['guest']));
        localStorage.setItem('meson-active-role', primary);
        localStorage.setItem('meson-role', primary);
    } catch { void 0 }
}

export const login = async (email, password) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        let message = 'Email ose password i gabuar!'
        let body = null
        try {
            body = await response.json()
            message = body.message || message
        } catch { void 0 }

        const error = new Error(message)
        error.locked = response.status === 423
        if (body?.retryAfterMinutes != null) {
            error.retryAfterMinutes = body.retryAfterMinutes
        }
        throw error
    }

    const data = await response.json();

    if (data.mustChangePassword) {
        // Temporary-password logins are not full sessions. Wipe any leftover
        // session state so the app treats the user as unauthenticated until
        // the password is changed — no half-logged-in access to other pages.
        localStorage.removeItem('userId')
        localStorage.removeItem('email')
        localStorage.removeItem('meson-role')
        localStorage.removeItem('meson-roles')
        localStorage.removeItem('meson-active-role')
    } else {
        localStorage.setItem('userId', data.userId)
        localStorage.setItem('email', email)
        persistRoles(data)
    }

    return {
        ...data,
        email: email,
    };
};

export const changeTemporaryPassword = async (currentPassword, newPassword) => {
    const response = await fetch(`${API_URL}/change-temporary-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
        let message = 'Ndryshimi i fjalëkalimit dështoi'
        try {
            const body = await response.json()
            message = body.message || message
        } catch { void 0 }
        throw new Error(message);
    }

    const data = await response.json();
    localStorage.setItem('userId', data.userId)
    localStorage.setItem('email', data.email)
    persistRoles(data)
    return data;
};

export const logout = async () => {
    try {
        await axiosInstance.post('/auth/logout')
    } catch { void 0 }
    localStorage.removeItem('email')
    localStorage.removeItem('meson-role')
    localStorage.removeItem('meson-roles')
    localStorage.removeItem('meson-active-role')
    localStorage.removeItem('userId')
    localStorage.removeItem('lastSubjectId')
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('userId');
};
