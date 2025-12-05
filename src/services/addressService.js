import config from '../config/env';

class AddressService {
  constructor() {
    this.baseURL = config.API_BASE_URL;
  }

  // Helper method to handle response errors
  async handleResponse(response) {
    // Check for authentication/authorization errors (400, 401, 403) - require logout
    if (response.status === 400 || response.status === 401 || response.status === 403) {
      const data = await response.json().catch(() => ({}));
      const error = new Error(data.error || data.message || 'Unauthorized. Please login again.');
      error.status = response.status;
      error.requiresLogout = true;
      throw error;
    }

    // Check for other errors
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;
      throw error;
    }

    return response;
  }

  async fetchAddresses(token) {
    try {
      const response = await fetch(`${this.baseURL}/user/addresses`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      await this.handleResponse(response);

      const data = await response.json();

      if (!data.status) {
        throw new Error(data.error || 'Failed to fetch addresses');
      }

      return {
        success: true,
        data: data.data || [],
        error: null,
        status: response.status
      };
    } catch (error) {
      console.error('Error fetching addresses:', error);
      return {
        success: false,
        data: [],
        error: error.message,
        status: error.status,
        requiresLogout: error.requiresLogout || false
      };
    }
  }

  async addAddress(addressData, token) {
    try {
      const response = await fetch(`${this.baseURL}/user/addresses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      });

      await this.handleResponse(response);

      const data = await response.json();

      if (!data.status) {
        throw new Error(data.error || 'Failed to add address');
      }

      return {
        success: true,
        data: data.data,
        error: null,
        status: response.status
      };
    } catch (error) {
      console.error('Error adding address:', error);
      return {
        success: false,
        data: null,
        error: error.message,
        status: error.status,
        requiresLogout: error.requiresLogout || false
      };
    }
  }

  async updateAddress(addressId, addressData, token) {
    try {
      const response = await fetch(`${this.baseURL}/user/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      });

      await this.handleResponse(response);

      const data = await response.json();

      if (!data.status) {
        throw new Error(data.error || 'Failed to update address');
      }

      return {
        success: true,
        data: data.data,
        error: null,
        status: response.status
      };
    } catch (error) {
      console.error('Error updating address:', error);
      return {
        success: false,
        data: null,
        error: error.message,
        status: error.status,
        requiresLogout: error.requiresLogout || false
      };
    }
  }

  async deleteAddress(addressId, token) {
    try {
      const response = await fetch(`${this.baseURL}/user/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      await this.handleResponse(response);

      const data = await response.json();

      if (!data.status) {
        throw new Error(data.error || 'Failed to delete address');
      }

      return {
        success: true,
        data: data.data,
        error: null,
        status: response.status
      };
    } catch (error) {
      console.error('Error deleting address:', error);
      return {
        success: false,
        data: null,
        error: error.message,
        status: error.status,
        requiresLogout: error.requiresLogout || false
      };
    }
  }

  async getShippingQuote(locationId, subtotal, coupon = null, token = null, customerEmail = null) {
    try {
      // Build query parameters
      const params = new URLSearchParams({
        location_id: locationId,
        subtotal: subtotal
      });

      // Only add coupon if it's provided
      if (coupon) {
        params.append('coupon', coupon);
      }

      // Add customer email if provided
      if (customerEmail) {
        params.append('customer_email', customerEmail);
      }

      // Build headers
      const headers = {
        'Content-Type': 'application/json',
      };

      // Add authorization token if provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}/front/shipping-quote?${params.toString()}`, {
        method: 'GET',
        headers: headers,
      });

      await this.handleResponse(response);

      const data = await response.json();

      if (!data.status) {
        throw new Error(data.error || 'Failed to fetch shipping quote');
      }

      // Return the full data structure from API
      // data.data contains: { location_id, subtotal, coupon, shipping, payable }
      return {
        success: true,
        data: data.data, // { location_id, subtotal, coupon: { code, type, value, discount, allow_free_shipping }, shipping, payable }
        error: null
      };
    } catch (error) {
      console.error('Error fetching shipping quote:', error);
      return {
        success: false,
        data: null,
        error: error.message,
        requiresLogout: error.requiresLogout || false
      };
    }
  }

  async fetchLocations() {
    try {
      const response = await fetch(`${this.baseURL}/front/locations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.status) {
        throw new Error(data.error || 'Failed to fetch locations');
      }

      return {
        success: true,
        data: data.locations || [],
        error: null
      };
    } catch (error) {
      console.error('Error fetching locations:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }
}

export default new AddressService();
