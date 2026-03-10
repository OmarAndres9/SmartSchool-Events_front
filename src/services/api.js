import axios from 'axios';

// Create an Axios instance with base configuration
const api = axios.create({
    // Asegúrate de cambiar esto a la URL de tu backend local de Laravel si es distinta
    baseURL: 'https://bug-free-potato-v65rjjjxvwpv2pq76-8080.app.github.dev/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Request interceptor to attach auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle common errors (like 401 Unauthorized)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Si el token expira o es inválido, cerramos sesión y mandamos al login
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
