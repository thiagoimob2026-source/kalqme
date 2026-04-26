// Centralized API URL — uses environment variable in production, localhost in dev
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005';

/**
 * Helper to create authenticated fetch options
 */
export const authHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

/**
 * Wrapper around fetch that auto-injects the base URL and auth header
 */
export const apiFetch = (path, options = {}) => {
    const url = `${API_URL}${path}`;
    const headers = {
        ...authHeaders(),
        ...(options.headers || {}),
    };
    return fetch(url, { ...options, headers });
};
