import api from './axios.js'

// RegisterMakerDto: { name, username, email, password }
export const registerMaker = (payload) => api.post('/api/maker/register', payload)

// LoginMakerDto: { usernameOrEmail, password }
export const loginMaker = (payload) => api.post('/api/maker/login', payload)
