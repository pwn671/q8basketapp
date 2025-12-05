import React from 'react';
import { useLocation } from '../hooks/useLocation';

// Example component showing how to use the useLocation hook
export const LocationExample = () => {
    const {
        coords,
        address,
        isLoadingLocation,
        isLoadingAddress,
        locationError,
        getCurrentLocation,
        setLocation,
        resetLocation
    } = useLocation({
        enableGeolocation: true,
        enableReverseGeocoding: true,
        enableSearch: false, // Disable search for this example
        defaultLocation: { lat: 25.2048, lng: 55.2708 }
    });

    return (
        <div>
            <h3>Location Hook Example</h3>
            
            {isLoadingLocation && <p>Getting current location...</p>}
            {isLoadingAddress && <p>Finding address...</p>}
            {locationError && <p>Error: {locationError}</p>}
            
            {coords && (
                <div>
                    <p><strong>Coordinates:</strong> {coords[0].toFixed(6)}, {coords[1].toFixed(6)}</p>
                    <p><strong>Address:</strong> {address}</p>
                </div>
            )}
            
            <div>
                <button onClick={getCurrentLocation}>
                    Get Current Location
                </button>
                <button onClick={() => setLocation(25.2048, 55.2708)}>
                    Set Dubai Location
                </button>
                <button onClick={resetLocation}>
                    Reset Location
                </button>
            </div>
        </div>
    );
};

export default LocationExample;
