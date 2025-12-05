import { useState, useEffect, useCallback } from 'react';
import config from '../config/env';
import { handleApiError, ERROR_TYPES } from '../utils/errorHandler';

const DEFAULT_LOCATION = { lat: 25.2048, lng: 55.2708 }; // Dubai default

// Check if running in Capacitor native environment
const isNative = typeof window !== 'undefined' && window.Capacitor !== undefined;

export const useLocation = (options = {}) => {
    const {
        enableGeolocation = true,
        enableReverseGeocoding = true,
        enableSearch = true,
        defaultLocation = DEFAULT_LOCATION,
        geolocationTimeout = 8000,
        searchDebounceMs = 300
    } = options;

    // Location state
    const [coords, setCoords] = useState(null);
    const [address, setAddress] = useState('');
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);
    const [locationError, setLocationError] = useState(null);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);

    // Reverse geocoding using Nominatim (moved before getCurrentLocation to fix dependency)
    const reverseGeocode = useCallback(async (lat, lon) => {
        if (!enableReverseGeocoding) return;

        setIsLoadingAddress(true);
        setLocationError(null);

        try {
            const response = await fetch(
                `${config.getNominatimUrl('/reverse')}?format=jsonv2&lat=${lat}&lon=${lon}`
            );
            
            if (!response.ok) {
                throw new Error('Reverse geocoding failed');
            }
            
            const data = await response.json();
            const displayName = data?.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
            setAddress(displayName);
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            
            // Enhanced error handling for reverse geocoding
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                setLocationError('Unable to get address. Check your internet connection.');
            } else if (error.message.includes('Reverse geocoding failed')) {
                setLocationError('Unable to get address from coordinates.');
            } else {
                setLocationError('Unable to get address. Using coordinates.');
            }
            
            setAddress(`${lat.toFixed(5)}, ${lon.toFixed(5)}`);
        } finally {
            setIsLoadingAddress(false);
        }
    }, [enableReverseGeocoding]);

    // Get current location using browser geolocation or Capacitor
    const getCurrentLocation = useCallback(async () => {
        if (!enableGeolocation) {
            setCoords([defaultLocation.lat, defaultLocation.lng]);
            if (enableReverseGeocoding) {
                reverseGeocode(defaultLocation.lat, defaultLocation.lng);
            }
            return Promise.resolve([defaultLocation.lat, defaultLocation.lng]);
        }

        setIsLoadingLocation(true);
        setLocationError(null);

        try {
            let coordinates;

            // Use browser geolocation (works in both web and native via WebView)
            if (navigator.geolocation) {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: geolocationTimeout,
                        maximumAge: 60000 // Accept cached position up to 1 minute old
                    });
                });
                coordinates = [position.coords.latitude, position.coords.longitude];
            } else {
                throw new Error('Geolocation not supported');
            }

            setCoords(coordinates);
            setIsLoadingLocation(false);
            
            if (enableReverseGeocoding) {
                reverseGeocode(coordinates[0], coordinates[1]);
            }
            
            return coordinates;
        } catch (error) {
            setIsLoadingLocation(false);
            
            // Enhanced error handling for geolocation
            if (error.code === 1) {
                setLocationError('Location access denied. Please enable location permissions.');
            } else if (error.code === 2) {
                setLocationError('Location unavailable. Please check your device settings.');
            } else if (error.code === 3) {
                setLocationError('Location request timeout. Please try again.');
            } else {
                setLocationError('Unable to get your location. Using default location.');
            }
            
            // Fallback to default location
            const fallbackCoords = [defaultLocation.lat, defaultLocation.lng];
            setCoords(fallbackCoords);
            
            if (enableReverseGeocoding) {
                reverseGeocode(defaultLocation.lat, defaultLocation.lng);
            }
            
            throw error;
        }
    }, [enableGeolocation, enableReverseGeocoding, defaultLocation, geolocationTimeout, reverseGeocode]);

    // Search locations using Nominatim
    const searchLocations = useCallback(async (query) => {
        if (!enableSearch || !query?.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        setSearchError(null);

        try {
            const response = await fetch(
                `${config.getNominatimUrl('/search')}?format=jsonv2&q=${encodeURIComponent(
                    query
                )}&addressdetails=1&limit=6`
            );
            
            if (!response.ok) {
                throw new Error('Location search failed');
            }
            
            const results = await response.json();
            setSearchResults(results || []);
        } catch (error) {
            console.error('Location search error:', error);
            
            // Enhanced error handling for location search
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                setSearchError('Unable to search locations. Check your internet connection.');
            } else {
                setSearchError('Unable to search locations. Please try again.');
            }
            
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [enableSearch]);

    // Debounced search function
    const debouncedSearch = useCallback((() => {
        let timeoutId;
        return (query) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                searchLocations(query);
            }, searchDebounceMs);
        };
    })(), [searchLocations, searchDebounceMs]);

    // Set location coordinates and optionally reverse geocode
    const setLocation = useCallback((lat, lng, shouldReverseGeocode = true) => {
        const newCoords = [lat, lng];
        setCoords(newCoords);
        
        if (shouldReverseGeocode && enableReverseGeocoding) {
            reverseGeocode(lat, lng);
        }
        
        return newCoords;
    }, [enableReverseGeocoding, reverseGeocode]);

    // Clear search results
    const clearSearch = useCallback(() => {
        setSearchResults([]);
        setSearchQuery('');
        setSearchError(null);
    }, []);

    // Reset all location data
    const resetLocation = useCallback(() => {
        setCoords(null);
        setAddress('');
        setLocationError(null);
        setIsLoadingLocation(false);
        setIsLoadingAddress(false);
        clearSearch();
    }, [clearSearch]);

    // Initialize location on mount if enabled
    useEffect(() => {
        if (enableGeolocation && !coords) {
            getCurrentLocation().catch(() => {
                // Error already handled in getCurrentLocation
                // This prevents unhandled promise rejection
            });
        }
    }, [enableGeolocation]); // Removed coords and getCurrentLocation from deps to prevent infinite loop

    return {
        // Location state
        coords,
        address,
        isLoadingLocation,
        isLoadingAddress,
        locationError,
        
        // Search state
        searchQuery,
        setSearchQuery,
        searchResults,
        isSearching,
        searchError,
        
        // Actions
        getCurrentLocation,
        reverseGeocode,
        searchLocations,
        debouncedSearch,
        setLocation,
        clearSearch,
        resetLocation,
        
        // Computed values
        hasLocation: !!coords,
        hasAddress: !!address,
        hasSearchResults: searchResults.length > 0,
        isLocationLoading: isLoadingLocation || isLoadingAddress,
        isSearchLoading: isSearching
    };
};

export default useLocation;
