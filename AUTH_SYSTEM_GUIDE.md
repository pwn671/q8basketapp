# Enhanced Authentication System Documentation

## Overview
This document describes the improved authentication system that consolidates Redux Toolkit state management with enhanced user data storage and token management.

## Key Improvements Made

### 1. **Consolidated Authentication State Management**
- **Removed**: Dual authentication systems (Redux + Context)
- **Added**: Single source of truth using Redux Toolkit
- **Benefit**: Eliminates state synchronization issues and reduces complexity

### 2. **Enhanced User Data Storage**
- **User Profile**: Complete user profile with addresses, payment methods, and preferences
- **Persistent Storage**: Automatic localStorage synchronization
- **State Management**: Centralized profile updates through Redux actions

### 3. **Automatic Token Management**
- **Token Refresh**: Automatic refresh before expiration
- **Error Handling**: 401 error handling with token refresh
- **Session Management**: Activity tracking and session timeout

### 4. **Improved Security**
- **Secure Storage**: Proper token storage and cleanup
- **Request Interceptors**: Automatic token attachment to requests
- **Logout Cleanup**: Complete state and storage cleanup on logout

## File Structure

```
src/
├── features/auth/
│   ├── authSlice.js          # Enhanced Redux slice
│   ├── authThunks.js         # Async thunks with token management
│   └── authMiddleware.js     # Token refresh middleware
├── hooks/
│   └── useAuth.js            # Custom authentication hooks
├── components/
│   └── AuthInitializer.jsx   # App initialization component
└── config/
    └── env.js                # Environment configuration
```

## Usage Examples

### Basic Authentication
```javascript
import { useAuth } from '../hooks/useAuth';

function LoginComponent() {
    const { login, logout, isAuthenticated, user, loading, error } = useAuth();

    const handleLogin = async (credentials) => {
        try {
            await login(credentials);
            // User is now logged in
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const handleLogout = async () => {
        await logout();
        // User is now logged out
    };

    return (
        <div>
            {isAuthenticated ? (
                <div>
                    <p>Welcome, {user?.name}!</p>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            ) : (
                <button onClick={() => handleLogin({ email, password })}>
                    Login
                </button>
            )}
        </div>
    );
}
```

### User Profile Management
```javascript
import { useUserProfile } from '../hooks/useAuth';

function ProfileComponent() {
    const { 
        userProfile, 
        addAddress, 
        removeAddress, 
        updatePreferences 
    } = useUserProfile();

    const handleAddAddress = (addressData) => {
        addAddress({
            id: Date.now(),
            ...addressData,
            createdAt: new Date().toISOString()
        });
    };

    const handleToggleDarkMode = () => {
        updatePreferences({
            darkMode: !userProfile.preferences.darkMode
        });
    };

    return (
        <div>
            <h2>User Profile</h2>
            <div>
                <h3>Addresses</h3>
                {userProfile.addresses.map(address => (
                    <div key={address.id}>
                        <p>{address.street}, {address.city}</p>
                        <button onClick={() => removeAddress(address.id)}>
                            Remove
                        </button>
                    </div>
                ))}
            </div>
            
            <div>
                <h3>Preferences</h3>
                <label>
                    <input 
                        type="checkbox" 
                        checked={userProfile.preferences.darkMode}
                        onChange={handleToggleDarkMode}
                    />
                    Dark Mode
                </label>
            </div>
        </div>
    );
}
```

### Activity Tracking
```javascript
import { useActivityTracker } from '../hooks/useAuth';

function App() {
    const { trackUserActivity, isUserActive } = useActivityTracker();

    useEffect(() => {
        // Track user activity on various events
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        
        events.forEach(event => {
            document.addEventListener(event, trackUserActivity, true);
        });

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, trackUserActivity, true);
            });
        };
    }, [trackUserActivity]);

    return (
        <div>
            {isUserActive() ? (
                <p>User is active</p>
            ) : (
                <p>User may be inactive</p>
            )}
        </div>
    );
}
```

## State Structure

### Auth State
```javascript
{
    user: {
        id: "123",
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        // ... other user fields
    },
    token: "jwt_token_here",
    refreshToken: "refresh_token_here",
    isAuthenticated: true,
    loading: false,
    error: null,
    userProfile: {
        addresses: [
            {
                id: "addr_1",
                street: "123 Main St",
                city: "New York",
                state: "NY",
                zipCode: "10001",
                isDefault: true
            }
        ],
        paymentMethods: [
            {
                id: "pm_1",
                type: "credit_card",
                last4: "1234",
                brand: "visa"
            }
        ],
        preferences: {
            notifications: true,
            darkMode: false,
            language: "en"
        }
    },
    lastActivity: 1640995200000,
    forgotStatus: null,
    isRegistered: false,
    resetStatus: null
}
```

## Environment Variables

Add these to your `.env` file:
```env
# API Configuration
VITE_API_BASE_URL=https://demo.q8basket.com/api
VITE_BACKEND_URL=https://demo.q8basket.com/api

# Auth Configuration (optional)
VITE_TOKEN_REFRESH_THRESHOLD=300000  # 5 minutes
VITE_SESSION_TIMEOUT=1800000         # 30 minutes
```

## Migration Guide

### From Old System
1. **Remove AuthContext**: Delete `src/context/AuthContext.jsx`
2. **Update Components**: Replace `useAuth` from context with `useAuth` from hooks
3. **Update Imports**: Change import paths to use new auth hooks
4. **Test Authentication**: Verify login/logout functionality

### Example Migration
```javascript
// OLD
import { useAuth } from '../../context/AuthContext';
const { user, login, logout } = useAuth();

// NEW
import { useAuth } from '../../hooks/useAuth';
const { user, login, logout } = useAuth();
```

## Benefits

1. **Single Source of Truth**: All auth state managed in Redux
2. **Automatic Token Management**: No manual token refresh needed
3. **Enhanced User Experience**: Persistent user preferences and data
4. **Better Error Handling**: Comprehensive error management
5. **Improved Security**: Proper token lifecycle management
6. **Developer Experience**: Clean, reusable hooks and actions

## Next Steps

1. **Test the Implementation**: Verify all authentication flows work correctly
2. **Update Components**: Migrate existing components to use new auth hooks
3. **Add Features**: Implement additional user profile features as needed
4. **Monitor Performance**: Track authentication performance and optimize if needed
