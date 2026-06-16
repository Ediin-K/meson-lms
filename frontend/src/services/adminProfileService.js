import axiosInstance from './axiosInstance'

export const getAdminStats = async () => {
    const { data } = await axiosInstance.get('/admin/stats')
    return data
}
