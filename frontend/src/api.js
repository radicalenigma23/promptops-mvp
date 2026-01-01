import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
});

export const registerUser = (email, password, fullName) => {
    return api.post('/auth/register', null, {
        params: { email, password, full_name: fullName }
    });
};

export const loginUser = (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    return api.post('/auth/token', formData);
};

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const fetchPrompts = () => api.get('/prompts/');

export const createPrompt = (name, content) => {
    // Note: We use query params here to match your current backend logic
    return api.post(`/prompts/create?name=${encodeURIComponent(name)}&content=${encodeURIComponent(content)}`);
};

export default api;