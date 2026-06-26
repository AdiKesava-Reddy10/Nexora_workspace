import axios from 'axios';

// Set backend baseURL. Standard localhost port 5000 as configured on server
const API_BASE_URL =
  import.meta.env.VITE_API_URL + "/api";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT bearer token if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nexora_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch auth failures
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized (token expired, corrupt), log out user
    if (error.response && error.response.status === 401) {
      console.warn('Authentication token expired or invalid. Logging out user...');
      localStorage.removeItem('nexora_token');
      localStorage.removeItem('nexora_user');
      
      // If we are not on public landing/login/register, redirect
      const publicPaths = ['/', '/login', '/register'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login?expired=true';
      }
    }
    
    // Normalize and return error messages
    const message = error.response?.data?.message || 'An error occurred during communication with the server.';
    return Promise.reject(new Error(message));
  }
);

export default api;
