export const handleApiError = (error) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('API Error:', error);
  }

  const message = error.response?.data?.message 
    || error.message 
    || 'An unexpected error occurred';

  return {
    error: true,
    message,
    status: error.response?.status || 500
  };
};

export const formatErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.message) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

export const isNetworkError = (error) => {
  return !error.response && !error.status && error.message === 'Network Error';
}; 