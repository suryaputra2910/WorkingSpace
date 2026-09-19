import api from './axios.js'

export const getMonthlyReport = (params = {}) => api.get('/api/admin/reports/monthly', { params })
export const getIncomeReport = (params = {}) => api.get('/api/admin/reports/income', { params })
