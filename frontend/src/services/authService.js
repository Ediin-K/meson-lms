import axiosInstance from './axiosInstance'

const API_URL = 'http://localhost:8080/api/auth';

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
        throw new Error('Email ose password i gabuar!');
    }

    const data = await response.json();

    // Temporary-password logins are not full sessions: don't persist auth state
    if (!data.mustChangePassword) {
        localStorage.setItem('userId', data.userId)
        localStorage.setItem('email', email)
        localStorage.setItem('meson-role', data.role ?? '')
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
    localStorage.setItem('meson-role', data.role ?? '')
    return data;
};

export const logout = async () => {
    try {
        await axiosInstance.post('/auth/logout')
    } catch { void 0 }
    localStorage.removeItem('email')
    localStorage.removeItem('meson-role')
    localStorage.removeItem('userId')
    localStorage.removeItem('lastSubjectId')
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('userId');
};
