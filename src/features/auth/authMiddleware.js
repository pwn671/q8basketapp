// Auth middleware for automatic token refresh and request handling
import { createListenerMiddleware } from '@reduxjs/toolkit';
import { refreshToken, logout } from './authSlice';

export const authMiddleware = createListenerMiddleware();

// Listen for 401 errors and attempt token refresh
authMiddleware.startListening({
    predicate: (action, currentState, previousState) => {
        // Check if any async thunk was rejected with 401 status
        return action.type.endsWith('/rejected') && 
               action.payload?.status === 401;
    },
    effect: async (action, listenerApi) => {
        const state = listenerApi.getState();
        
        // Only attempt refresh if we have a refresh token
        if (state.auth.refreshToken) {
            try {
                await listenerApi.dispatch(refreshToken()).unwrap();
                // Token refreshed successfully, you might want to retry the original request
                console.log('Token refreshed successfully');
            } catch (error) {
                // Refresh failed, logout user
                listenerApi.dispatch(logout());
                console.log('Token refresh failed, user logged out');
            }
        } else {
            // No refresh token, logout immediately
            listenerApi.dispatch(logout());
        }
    },
});

// Listen for successful login to initialize user profile
authMiddleware.startListening({
    actionCreator: loginUser.fulfilled,
    effect: async (action, listenerApi) => {
        // Fetch additional user profile data after successful login
        try {
            await listenerApi.dispatch(getUserProfile()).unwrap();
        } catch (error) {
            console.warn('Failed to fetch user profile:', error);
        }
    },
});

export default authMiddleware;
