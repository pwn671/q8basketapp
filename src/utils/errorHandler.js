// Centralized error handling utility
import { toast } from 'react-toastify';

/**
 * Error types and their corresponding user-friendly messages
 */
export const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  PARSE_ERROR: 'PARSE_ERROR'
};

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK_ERROR]: 'Unable to connect to the server. Please check your internet connection.',
  [ERROR_TYPES.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ERROR_TYPES.AUTHENTICATION_ERROR]: 'Your session has expired. Please sign in again.',
  [ERROR_TYPES.AUTHORIZATION_ERROR]: 'You do not have permission to perform this action.',
  [ERROR_TYPES.SERVER_ERROR]: 'Something went wrong on our end. Please try again later.',
  [ERROR_TYPES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
  [ERROR_TYPES.TIMEOUT_ERROR]: 'The request took too long. Please try again.',
  [ERROR_TYPES.PARSE_ERROR]: 'Unable to process the response. Please try again.'
};

/**
 * HTTP status code mappings
 */
export const HTTP_STATUS_MESSAGES = {
  400: 'Invalid request. Please check your input.',
  401: 'Please sign in to continue.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  408: 'Request timeout. Please try again.',
  409: 'This action conflicts with existing data.',
  422: 'Please check your input and try again.',
  429: 'Too many requests. Please wait a moment.',
  500: 'Server error. Please try again later.',
  502: 'Service temporarily unavailable.',
  503: 'Service temporarily unavailable.',
  504: 'Request timeout. Please try again.'
};

/**
 * Categorizes an error based on its properties
 */
export const categorizeError = (error) => {
  // Network errors
  if (!navigator.onLine) {
    return ERROR_TYPES.NETWORK_ERROR;
  }
  
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return ERROR_TYPES.NETWORK_ERROR;
  }
  
  if (error.name === 'AbortError') {
    return ERROR_TYPES.TIMEOUT_ERROR;
  }
  
  // HTTP status errors
  if (error.status) {
    if (error.status >= 500) {
      return ERROR_TYPES.SERVER_ERROR;
    }
    if (error.status === 401) {
      return ERROR_TYPES.AUTHENTICATION_ERROR;
    }
    if (error.status === 403) {
      return ERROR_TYPES.AUTHORIZATION_ERROR;
    }
    if (error.status >= 400 && error.status < 500) {
      return ERROR_TYPES.VALIDATION_ERROR;
    }
  }
  
  // Parse errors
  if (error.name === 'SyntaxError' || error.message.includes('JSON')) {
    return ERROR_TYPES.PARSE_ERROR;
  }
  
  return ERROR_TYPES.UNKNOWN_ERROR;
};

/**
 * Extracts user-friendly error message from various error formats
 */
export const extractErrorMessage = (error, fallbackMessage = 'Something went wrong') => {
  // If it's already a string, return it
  if (typeof error === 'string') {
    return error;
  }
  
  // If it's an object with message property
  if (error && typeof error === 'object') {
    // Check for nested error messages
    if (error.message) {
      return error.message;
    }
    
    // Check for error array (common in validation errors)
    if (Array.isArray(error)) {
      return error.join(', ');
    }
    
    // Check for error object with field-specific messages
    if (error.error && typeof error.error === 'object') {
      const messages = [];
      Object.entries(error.error).forEach(([field, fieldErrors]) => {
        if (Array.isArray(fieldErrors)) {
          messages.push(...fieldErrors);
        } else {
          messages.push(fieldErrors);
        }
      });
      return messages.join(', ');
    }
    
    // Check for data.message
    if (error.data && error.data.message) {
      return error.data.message;
    }
    
    // Check for status-specific message
    if (error.status && HTTP_STATUS_MESSAGES[error.status]) {
      return HTTP_STATUS_MESSAGES[error.status];
    }
  }
  
  return fallbackMessage;
};

/**
 * Handles API response errors gracefully
 */
export const handleApiError = (error, customMessage = null) => {
  console.error('API Error:', error);
  
  const errorType = categorizeError(error);
  let message = customMessage;
  
  if (!message) {
    // Try to extract message from error
    message = extractErrorMessage(error);
    
    // If no specific message found, use generic message based on error type
    if (message === 'Something went wrong' || !message) {
      message = ERROR_MESSAGES[errorType];
    }
  }
  
  // Show toast notification
  toast.error(message);
  
  return {
    type: errorType,
    message,
    originalError: error
  };
};

/**
 * Handles API response parsing with error handling
 */
export const parseApiResponse = async (response) => {
  try {
    const data = await response.json();

    // Check if response is successful
    if (!response.ok) {
      const error = {
        status: response.status,
        message: data?.message || data?.error?.message || HTTP_STATUS_MESSAGES[response.status] || 'Request failed',
        data: data
      };
      throw error;
    }

    // Check if data indicates success
    if (data.status === false) {
      // Check if error is a validation error object (e.g., { email: [...], password: [...] })
      let errorMessage = data?.message;

      if (!errorMessage && data?.error && typeof data.error === 'object' && !Array.isArray(data.error)) {
        // If error is an object with field-specific errors, format them
        const messages = [];
        Object.entries(data.error).forEach(([field, fieldErrors]) => {
          if (Array.isArray(fieldErrors)) {
            messages.push(...fieldErrors);
          } else if (typeof fieldErrors === 'string') {
            messages.push(fieldErrors);
          }
        });
        errorMessage = messages.length > 0 ? messages.join(', ') : 'Request failed';
      } else if (!errorMessage && data?.error) {
        // If error is a string or has a message property
        errorMessage = typeof data.error === 'string' ? data.error : data.error.message;
      }

      const error = {
        status: response.status,
        message: errorMessage || 'Request failed',
        data: data,
        validationErrors: (data?.error && typeof data.error === 'object' && !Array.isArray(data.error)) ? data.error : null
      };
      throw error;
    }

    return data;
  } catch (error) {
    // If it's already our custom error, re-throw it
    if (error.status) {
      throw error;
    }

    // If it's a JSON parse error
    if (error.name === 'SyntaxError') {
      throw {
        type: ERROR_TYPES.PARSE_ERROR,
        message: 'Invalid response format',
        originalError: error
      };
    }

    // Re-throw other errors
    throw error;
  }
};

/**
 * Creates a safe API call wrapper with error handling
 */
export const safeApiCall = async (apiCall, options = {}) => {
  const {
    showErrorToast = true,
    customErrorMessage = null,
    fallbackValue = null,
    onError = null
  } = options;
  
  try {
    const response = await apiCall();
    return response;
  } catch (error) {
    if (onError) {
      onError(error);
    }
    
    if (showErrorToast) {
      handleApiError(error, customErrorMessage);
    }
    
    return fallbackValue;
  }
};

/**
 * Debounced error handler to prevent spam
 */
let lastErrorTime = 0;
const ERROR_DEBOUNCE_TIME = 2000; // 2 seconds

export const debouncedErrorHandler = (error, customMessage = null) => {
  const now = Date.now();
  if (now - lastErrorTime < ERROR_DEBOUNCE_TIME) {
    return; // Skip this error to prevent spam
  }
  
  lastErrorTime = now;
  handleApiError(error, customMessage);
};

/**
 * Validation error formatter
 */
export const formatValidationErrors = (errors) => {
  if (typeof errors === 'string') {
    return errors;
  }
  
  if (Array.isArray(errors)) {
    return errors.join(', ');
  }
  
  if (typeof errors === 'object') {
    const messages = [];
    Object.entries(errors).forEach(([field, fieldErrors]) => {
      if (Array.isArray(fieldErrors)) {
        messages.push(...fieldErrors);
      } else {
        messages.push(fieldErrors);
      }
    });
    return messages.join(', ');
  }
  
  return 'Validation failed';
};

export default {
  ERROR_TYPES,
  ERROR_MESSAGES,
  HTTP_STATUS_MESSAGES,
  categorizeError,
  extractErrorMessage,
  handleApiError,
  parseApiResponse,
  safeApiCall,
  debouncedErrorHandler,
  formatValidationErrors
};
