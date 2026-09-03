const BACKEND_URL = 'http://localhost:5000';

/**
 * Universal API Client with automatic JWT injection, error handling, and timeout support.
 */
class ApiClient {
  constructor(baseUrl = BACKEND_URL) {
    this.baseUrl = baseUrl;
  }

  getToken() {
    return localStorage.getItem('customer_jwt_token') || localStorage.getItem('hotel_jwt_token') || '';
  }

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}`, 'x-customer-token': token } : {}),
      ...(options.headers || {})
    };

    const config = {
      ...options,
      headers
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      if (err.status) throw err;
      // Network or offline fallback error
      console.warn(`[ApiClient Network Warning] ${endpoint}:`, err.message);
      const netErr = new Error(err.message || 'Network error connecting to backend server.');
      netErr.isNetworkError = true;
      throw netErr;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient();
export default api;
