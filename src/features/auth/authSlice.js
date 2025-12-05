// Enhanced auth slice with better state management
import { createSlice } from '@reduxjs/toolkit';
import { loginUser, forgotPassword, resetPassword, registerUser, logoutUser, updateUserProfile } from './authThunks';

const initialState = {
    user: null,
    token: null,
    loading: false,
    error: null,
    forgotStatus: null,
    isRegistered: false,
    resetStatus: null,
    isAuthenticated: false,
    // User profile data
    userProfile: {
        addresses: [],
        paymentMethods: [],
        preferences: {
            notifications: true,
            darkMode: false,
            language: 'en'
        }
    }
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Simple logout
        logout(state) {
            state.user = null;
            state.token = null;
            state.error = null;
            state.isAuthenticated = false;
            state.userProfile = initialState.userProfile;
            
            // Clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userProfile');
        },
        
        // Reset auth state
        resetAuthState(state) {
            state.error = null;
            state.isRegistered = false;
            state.forgotStatus = null;
            state.resetStatus = null;
        },
        
        // Update user profile data (local state, not API call)
        setUserProfileData(state, action) {
            state.userProfile = { ...state.userProfile, ...action.payload };
            localStorage.setItem('userProfile', JSON.stringify(state.userProfile));
        },
        
        // Update user preferences
        updatePreferences(state, action) {
            state.userProfile.preferences = { 
                ...state.userProfile.preferences, 
                ...action.payload 
            };
            localStorage.setItem('userProfile', JSON.stringify(state.userProfile));
        },
        
        // Initialize auth state from localStorage
        initializeAuth(state) {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');
            const userProfile = localStorage.getItem('userProfile');
            
            if (token && user) {
                state.token = token;
                state.user = JSON.parse(user);
                state.isAuthenticated = true;
                
                if (userProfile) {
                    state.userProfile = JSON.parse(userProfile);
                }
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Login cases
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user || action.payload;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.error = null;
                
                // Store in localStorage
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('user', JSON.stringify(action.payload.user || action.payload));
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || { message: 'Login failed', status: 500 };
                state.token = null;
                state.user = null;
                state.isAuthenticated = false;
            })
            
            // Logout cases
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.error = null;
                state.userProfile = initialState.userProfile;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Logout failed';
                // Still clear local state even if server logout fails
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
            })
            
            // Other cases (forgot password, reset password, register)
            .addCase(forgotPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.forgotStatus = null;
            })
            .addCase(forgotPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.forgotStatus = action.payload.message || 'OTP sent successfully';
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to send OTP';
            })
            
            .addCase(resetPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.resetStatus = null;
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.resetStatus = action.payload.message || 'Password updated successfully';
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Password reset failed';
            })
            
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.isRegistered = false;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.isRegistered = true;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Registration failed';
                state.isRegistered = false;
            })
            
            // Update user profile cases
            .addCase(updateUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                // Update user data with new profile information
                if (action.payload) {
                    state.user = { ...state.user, ...action.payload };
                    localStorage.setItem('user', JSON.stringify(state.user));
                }
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to update profile';
            });
    },
});

export default authSlice.reducer;
export const { 
    logout, 
    resetAuthState, 
    setUserProfileData,
    updatePreferences, 
    initializeAuth 
} = authSlice.actions;