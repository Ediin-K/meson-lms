import axiosInstance from './axiosInstance'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export const getMyAccount = async () => {
    const { data } = await axiosInstance.get('/account/me')
    return data
}

export const updateMyAccount = async (payload) => {
    const { data } = await axiosInstance.patch('/account/me', payload)
    return data
}

export const changeMyPassword = async (currentPassword, newPassword) => {
    const { data } = await axiosInstance.post('/account/password', { currentPassword, newPassword })
    return data
}

export const uploadMyPhoto = async (file) => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await axiosInstance.post('/account/photo', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
}

export const removeMyPhoto = async () => {
    const { data } = await axiosInstance.delete('/account/photo')
    return data
}

/** Absolute URL for a user's avatar, usable as an <img> src. `bust` busts the cache after a change. */
export const accountPhotoSrc = (userId, bust) =>
    `${API_BASE_URL}/account/${userId}/photo${bust ? `?v=${bust}` : ''}`
