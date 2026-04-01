import axios from 'axios';

let API_BASE_URL = import.meta.env.VITE_API_URI || 'http://localhost:5000/api';
// Auto-append /api if not already present
if (!API_BASE_URL.endsWith('/api')) {
  API_BASE_URL = API_BASE_URL.replace(/\/+$/, '') + '/api';
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  if (userInfo && userInfo.token) {
    config.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return config;
});

// Auto-redirect to login on 401 (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('userInfo');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Form APIs
export const formAPI = {
  createForm: (formData) => api.post('/forms', formData),
  getForm: (id) => api.get(`/forms/${id}`),
  getFormByToken: (token) => api.get(`/forms/public/${token}`),
  updateForm: (id, formData) => api.put(`/forms/${id}`, formData),
  getAllForms: () => api.get('/forms'),
  deleteForm: (id) => api.delete(`/forms/${id}`),
};

// Response APIs
export const responseAPI = {
  submitResponse: (responseData) => api.post('/responses', responseData),
  submitPublicResponse: (responseData) => api.post('/responses/public', responseData),
  getFormResponses: (formId) => api.get(`/responses/${formId}`),
  getResponseCount: (formId) => api.get(`/responses/${formId}/count`),
};

// Email APIs
export const emailAPI = {
  sendInvites: (data) => api.post('/email/invite', data),
};

// Cloudinary Upload API (Backend-routed)
export const cloudinaryAPI = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};

export default api;
