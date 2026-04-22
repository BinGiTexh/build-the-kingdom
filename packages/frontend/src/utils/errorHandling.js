export const getErrorMessage = (error) => {
  if (error.response) {
    // Server responded with error
    return error.response.data.message || error.response.data.error || 'An error occurred';
  } else if (error.request) {
    // Request made but no response
    return 'Unable to connect to server';
  } else {
    // Something else went wrong
    return error.message || 'An unexpected error occurred';
  }
};

export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  if (error.response?.status === 401) {
    return 'Please log in to continue';
  }
  
  if (error.response?.status === 403) {
    return 'You do not have permission to perform this action';
  }
  
  if (error.response?.status === 404) {
    return 'The requested resource was not found';
  }
  
  if (error.response?.status === 422) {
    return error.response.data.message || 'Invalid input data';
  }
  
  return error.response?.data?.message || defaultMessage;
};

