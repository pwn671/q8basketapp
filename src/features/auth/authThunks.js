// Enhanced auth thunks with better error handling and token management
import { createAsyncThunk } from '@reduxjs/toolkit';
import config from '../../config/env';
import { parseApiResponse, handleApiError, ERROR_TYPES } from '../../utils/errorHandler';

// Helper function to make authenticated requests with enhanced error handling
const makeAuthenticatedRequest = async (url, options = {}, token) => {
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };
    
    if (token) {
        defaultHeaders.Authorization = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(url, {
            ...options,
            headers: { ...defaultHeaders, ...options.headers },
        });
        
        return response;
    } catch (error) {
        // Handle network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw {
                type: ERROR_TYPES.NETWORK_ERROR,
                message: 'Unable to connect to the server. Please check your internet connection.',
                originalError: error
            };
        }
        
        // Handle timeout errors
        if (error.name === 'AbortError') {
            throw {
                type: ERROR_TYPES.TIMEOUT_ERROR,
                message: 'Request timeout. Please try again.',
                originalError: error
            };
        }
        
        throw error;
    }
};

// Login
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await makeAuthenticatedRequest(
                `${config.API_BASE_URL}/user/login`,
                {
                    method: 'POST',
                    body: JSON.stringify({ email, password }),
                }
            );

            const data = await parseApiResponse(response);

            // Return complete user data structure
            return {
                user: data.data.user || data.data,
                token: data.data.token,
                refreshToken: data.data.refreshToken,
            };
        } catch (error) {
            console.error('Login error:', error);

            // parseApiResponse already formatted the error message
            return rejectWithValue({
                message: error.message || 'Login failed. Please check your credentials.',
                type: error.type || ERROR_TYPES.AUTHENTICATION_ERROR,
                status: error.status || 500,
                originalError: error
            });
        }
    }
);

// Token Refresh
export const refreshToken = createAsyncThunk(
    'auth/refreshToken',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const refreshTokenValue = state.auth.refreshToken || localStorage.getItem('refreshToken');
            
            if (!refreshTokenValue) {
                return rejectWithValue('No refresh token available');
            }

            const response = await makeAuthenticatedRequest(
                `${config.API_BASE_URL}/user/refresh`,
                {
                    method: 'POST',
                    body: JSON.stringify({ refreshToken: refreshTokenValue }),
                }
            );

            const data = await response.json();

            if (!response.ok || data.status !== true) {
                return rejectWithValue('Token refresh failed');
            }

            return {
                token: data.data.token,
                refreshToken: data.data.refreshToken,
            };
        } catch (error) {
            return rejectWithValue('Token refresh failed');
        }
    }
);

// Get User Profile
export const getUserProfile = createAsyncThunk(
    'auth/getUserProfile',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const token = state.auth.token || localStorage.getItem('token');
            
            if (!token) {
                return rejectWithValue('No token available');
            }

            const response = await makeAuthenticatedRequest(
                `${config.API_BASE_URL}/user/profile`,
                {
                    method: 'GET',
                },
                token
            );

            const data = await response.json();

            if (!response.ok || data.status !== true) {
                return rejectWithValue('Failed to fetch user profile');
            }

            return data.data;
        } catch (error) {
            return rejectWithValue('Failed to fetch user profile');
        }
    }
);

// Update User Profile
// Endpoint: base_url/user/profile/complete
export const updateUserProfile = createAsyncThunk(
    'auth/updateUserProfile',
    async (profileData, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const token = state.auth.token || localStorage.getItem('token');
            
            if (!token) {
                return rejectWithValue('No token available');
            }

            // Using base_url/user/profile/complete endpoint for profile updates
            const response = await makeAuthenticatedRequest(
                `${config.API_BASE_URL}/user/profile/update`,
                {
                    method: 'POST',
                    body: JSON.stringify(profileData),
                },
                token
            );

            const data = await response.json();

            if (!response.ok || data.status !== true) {
                return rejectWithValue(data.error || data.message || 'Failed to update profile');
            }

            return data.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update profile');
        }
    }
);

// Forgot Password (Request OTP)
export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async ({ email }, { rejectWithValue }) => {
        try {
            const response = await makeAuthenticatedRequest(
                `${config.API_BASE_URL}/user/forgot`,
                {
                    method: 'POST',
                    body: JSON.stringify({ email }),
                }
            );

            const data = await response.json();

            if (!response.ok || data.status !== true) {
                return rejectWithValue({
                    message: data.message || 'Failed to send reset email',
                    status: response.status,
                });
            }

            return data;
        } catch (error) {
            return rejectWithValue({
                message: error.message || 'Network error',
                status: 500,
            });
        }
    }
);

// Reset Password (Submit OTP + New Password)
export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async ({ email, otp, new_password, confirm_password }, { rejectWithValue }) => {
        try {
            const response = await makeAuthenticatedRequest(
                `${config.API_BASE_URL}/user/forgot/submit`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        email,
                        otp,
                        new_password,
                        confirm_password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || data.status !== true) {
                return rejectWithValue(data.message || 'Failed to reset password');
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Register
export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await makeAuthenticatedRequest(
                `${config.API_BASE_URL}/user/registration`,
                {
                    method: 'POST',
                    body: JSON.stringify(userData),
                }
            );

            const data = await parseApiResponse(response);
            return data;
        } catch (error) {
            console.error('Registration error:', error);

            // If parseApiResponse already formatted the error message, use it
            // This handles both validation errors and other API errors
            return rejectWithValue({
                message: error.message || 'Registration failed. Please try again.',
                validationErrors: error.validationErrors || null,
                type: error.validationErrors ? ERROR_TYPES.VALIDATION_ERROR : ERROR_TYPES.UNKNOWN_ERROR,
                status: error.status || 500,
                originalError: error
            });
        }
    }
);

// Logout
export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { getState, rejectWithValue }) => {
        const token = getState().auth.token || localStorage.getItem('token');

        if (!token) {
            // Even without token, clear local state
            return true;
        }

        try {
            const response = await makeAuthenticatedRequest(
                `${config.API_BASE_URL}/user/logout`,
                {
                    method: 'POST',
                    body: JSON.stringify({}),
                },
                token
            );

            const data = await response.json();

            // Clear localStorage regardless of server response
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('userProfile');

            if (!response.ok || data.status !== true) {
                console.warn('Server logout failed, but local logout completed');
            }

            return true;
        } catch (error) {
            // Clear localStorage even if network request fails
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('userProfile');
            
            console.warn('Network error during logout, but local logout completed');
            return true;
        }
    }
);