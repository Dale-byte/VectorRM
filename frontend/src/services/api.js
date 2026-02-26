const BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    console.log('API Request:', endpoint, 'Token exists:', !!token);
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    console.log('API Response:', response.status, response.statusText);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      console.log('API Error:', error);
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { 
      ...options, 
      method: 'DELETE',
      body: JSON.stringify({}) 
    });
  }
}

export const api = new ApiService();
