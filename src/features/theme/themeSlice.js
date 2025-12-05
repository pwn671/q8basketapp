import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    mode: 'light', // 'light' or 'dark'
    systemTheme: null, // 'light', 'dark', or null
    autoDetect: false, // Whether to follow system theme
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setThemeMode: (state, action) => {
            state.mode = action.payload;
            state.autoDetect = false;
            localStorage.setItem('themeMode', action.payload);
        },
        
        toggleTheme: (state) => {
            state.mode = state.mode === 'light' ? 'dark' : 'light';
            state.autoDetect = false;
            localStorage.setItem('themeMode', state.mode);
        },
        
        setSystemTheme: (state, action) => {
            state.systemTheme = action.payload;
        },
        
        enableAutoDetect: (state) => {
            state.autoDetect = true;
            state.mode = state.systemTheme || 'light';
            localStorage.setItem('themeAutoDetect', 'true');
        },
        
        disableAutoDetect: (state) => {
            state.autoDetect = false;
            localStorage.setItem('themeAutoDetect', 'false');
        },
        
        initializeTheme: (state) => {
            const savedMode = localStorage.getItem('themeMode');
            const autoDetect = localStorage.getItem('themeAutoDetect') === 'true';
            
            if (autoDetect) {
                state.autoDetect = true;
                state.mode = state.systemTheme || 'light';
            } else if (savedMode) {
                state.mode = savedMode;
                state.autoDetect = false;
            }
        }
    }
});

export default themeSlice.reducer;
export const {
    setThemeMode,
    toggleTheme,
    setSystemTheme,
    enableAutoDetect,
    disableAutoDetect,
    initializeTheme
} = themeSlice.actions;
