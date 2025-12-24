const API_URL = '/api';

const api = {
    // Helper for adding auth header
    async request(endpoint, method = 'GET', body = null, isFileUpload = false) {
        const token = localStorage.getItem('token');
        const headers = {};

        if (!isFileUpload) {
            headers['Content-Type'] = 'application/json';
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            method,
            headers,
        };

        if (body) {
            config.body = isFileUpload ? body : JSON.stringify(body);
        }

        const response = await fetch(`${API_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    },

    // Auth
    login: (email, password) => api.request('/auth/login', 'POST', { email, password }),
    register: (name, email, password) => api.request('/auth/register', 'POST', { name, email, password }),
    getMe: () => api.request('/auth/me'),

    // Resources
    getResources: () => api.request('/resources'),
    getResource: (id) => api.request(`/resources/${id}`),

    // Bookings
    getBookings: () => api.request('/bookings'),
    getAllBookings: () => api.request('/bookings/all'),
    createBooking: (bookingData) => api.request('/bookings', 'POST', bookingData),
    cancelBooking: (id) => api.request(`/bookings/${id}`, 'DELETE'),
    uploadFile: (id, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.request(`/bookings/${id}/upload`, 'POST', formData, true);
    }
};
