import axios from 'axios';

// Function to determine the API URL based on the environment
const getApiUrl = () => {
  // For local development
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL;
  }
  
  // For deployed environments, check the URL
  const currentUrl = window.location.origin;
  
  // For dev/staging branch deployment
  if (currentUrl.includes('-git-dev-') || currentUrl.includes('-git-staging-')) {
    return import.meta.env.VITE_API_URL_DEV;
  }
  
  // For production/main branch
  return import.meta.env.VITE_API_URL_PROD;
};

// Debug: Log the API URL being used
const apiUrl = getApiUrl();
console.log('API URL being used:', apiUrl);
console.log('Environment:', import.meta.env.MODE);
console.log('Current URL:', window.location.origin);

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Enable if you're using cookies
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Debug: Log outgoing requests
    console.log('Request URL:', `${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 