// CheckoutAddress.js
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import AddressPicker from "./AddressPickerPage";
import addressService from "../../services/addressService";

export default function SaveAddress() {
  const [pickerOpen, setPickerOpen] = useState(true);
  const [savedAddress, setSavedAddress] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSaveAddress = async (addrObj) => {
    if (!isAuthenticated || !token) {
      setError('Please login to save addresses');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Map label to uppercase for API
      const labelMap = {
        'home': 'HOME',
        'work': 'OFFICE', 
        'hotel': 'HOTEL',
        'other': 'OTHER'
      };

      // Transform the address object to match API format
      const addressData = {
        label: labelMap[addrObj.label] || 'OTHER',
        address: addrObj.locationName || addrObj.display_address,
        apartment_building: addrObj.flat || null,
        landmark: addrObj.floor ? `Floor ${addrObj.floor}` : null,
        location_id: addrObj.locationId || 1,
        latitude: parseFloat(addrObj.lat) || 0,
        longitude: parseFloat(addrObj.lng) || 0,
        is_default: false // New addresses are not default by default
      };

      const result = await addressService.addAddress(addressData, token);
      
      if (result.success) {
        setSavedAddress(result.data);
        // Navigate back to address page after successful save
        // Pass state to indicate where we came from
        const fromState = location.state?.from || '/my-address';
        setTimeout(() => {
          navigate('/my-address', { state: { from: '/address-picker', preventLoop: true }, replace: true });
        }, 1000);
      } else {
        setError(result.error || 'Failed to save address');
      }
    } catch (err) {
      console.error('Error saving address:', err);
      setError('Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AddressPicker
        show={pickerOpen}
        onClose={() => {
          const fromState = location.state?.from || '/my-address';
          navigate('/my-address', { state: { from: '/address-picker', preventLoop: true }, replace: true });
        }}
        onSave={handleSaveAddress}
      />

      {saving && (
        <div style={{ 
          position: 'fixed', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999
        }}>
          <p>Saving address...</p>
        </div>
      )}

      {error && (
        <div style={{ 
          position: 'fixed', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          color: '#e74c3c'
        }}>
          <p>{error}</p>
          <button onClick={() => setError(null)}>Close</button>
        </div>
      )}

      {savedAddress && (
        <div style={{ 
          position: 'fixed', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          color: '#27ae60'
        }}>
          <p>Address saved successfully!</p>
        </div>
      )}
    </div>
  );
}
