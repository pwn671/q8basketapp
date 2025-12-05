// Simplified auth hook - focused on login, logout, and user storage
import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { loginUser, logoutUser } from '../features/auth/authThunks';
import { 
    setUserProfileData, 
    updatePreferences, 
    initializeAuth 
} from '../features/auth/authSlice';

export const useAuth = () => {
    const dispatch = useDispatch();
    const authState = useSelector((state) => state.auth);

    const login = useCallback(async (credentials) => {
        return dispatch(loginUser(credentials));
    }, [dispatch]);

    const logout = useCallback(async () => {
        return dispatch(logoutUser());
    }, [dispatch]);

    const updateProfileData = useCallback((profileData) => {
        dispatch(setUserProfileData(profileData));
    }, [dispatch]);

    const updateUserPreferences = useCallback((preferences) => {
        dispatch(updatePreferences(preferences));
    }, [dispatch]);

    const initializeAuthState = useCallback(() => {
        dispatch(initializeAuth());
    }, [dispatch]);

    return {
        // State
        user: authState.user,
        token: authState.token,
        isAuthenticated: authState.isAuthenticated,
        loading: authState.loading,
        error: authState.error,
        userProfile: authState.userProfile,
        
        // Actions
        login,
        logout,
        updateProfileData,
        updateUserPreferences,
        initializeAuthState,
    };
};

// Hook for checking authentication status
export const useIsAuthenticated = () => {
    const { isAuthenticated, user, token } = useAuth();
    return isAuthenticated && !!user && !!token;
};

// Hook for user profile management
export const useUserProfile = () => {
    const { userProfile, updateUserPreferences, updateProfileData } = useAuth();
    
    const addAddress = useCallback((address) => {
        const updatedAddresses = [...userProfile.addresses, address];
        updateProfileData({ addresses: updatedAddresses });
    }, [userProfile.addresses, updateProfileData]);

    const removeAddress = useCallback((addressId) => {
        const updatedAddresses = userProfile.addresses.filter(addr => addr.id !== addressId);
        updateProfileData({ addresses: updatedAddresses });
    }, [userProfile.addresses, updateProfileData]);

    const updateAddress = useCallback((addressId, updatedAddress) => {
        const updatedAddresses = userProfile.addresses.map(addr => 
            addr.id === addressId ? { ...addr, ...updatedAddress } : addr
        );
        updateProfileData({ addresses: updatedAddresses });
    }, [userProfile.addresses, updateProfileData]);

    return {
        userProfile,
        addAddress,
        removeAddress,
        updateAddress,
        updatePreferences: updateUserPreferences,
    };
};
