const API_URL = 'http://localhost:8080/api/auth';

export const login = async (email, password) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({email, password}),
    });

    if (!response.ok) {
        throw new Error('Email ose password i gabuar!');
    }

    return response.json();

    export const register = async (emri, mbiemri, email, password, roli) => {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({emri, mbiemri, email, password, roli}),
        });

        if (!response.ok) {
            throw new Error('Regjistrim i dështuar!');
        }

        return response.json();
    };

    export const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
    };

    export const getToken = () => {
        return localStorage.getItem('token');
    };

    export const isAuthenticated = () => {
        return !!localStorage.getItem('token');
    };
}