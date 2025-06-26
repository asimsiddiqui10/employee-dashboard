import axios from 'axios';

// Function to determine the API URL based on the environment
const getApiUrl = () => {
  // For local development
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL;
  }
  
  // For production, always use PROD URL
  return import.meta.env.VITE_API_URL_PROD;
};

// Debug: Log the API URL being used
const apiUrl = getApiUrl();
console.log('API Configuration:', {
  apiUrl,
  environment: import.meta.env.MODE,
  currentUrl: window.location.origin,
  dev: import.meta.env.DEV,
  prod: import.meta.env.PROD
});

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Debug: Log outgoing requests
    console.log('Making request to:', `${config.baseURL}${config.url}`, {
      method: config.method,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error information
    console.error('Response error:', {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config,
      message: error.message
    });

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 