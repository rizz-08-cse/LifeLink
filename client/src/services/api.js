/**
 * API client service for LifeLink REST endpoints
 */

const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('lifelink_token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth
  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  login: async (credentials) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    return res.json();
  },

  updateLocation: async (coords) => {
    const res = await fetch(`${API_BASE}/auth/location`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(coords)
    });
    return res.json();
  },

  // Donors
  toggleAvailability: async () => {
    const res = await fetch(`${API_BASE}/donors/availability`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return res.json();
  },

  searchNearbyDonors: async (params) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/donors/nearby?${query}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getDonorsDirectory: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/donors?${query}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getMyDonationHistory: async () => {
    const res = await fetch(`${API_BASE}/donors/history`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // Requests
  createRequest: async (requestData) => {
    const res = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(requestData)
    });
    return res.json();
  },

  getRequests: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/requests?${query}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getRequestById: async (id) => {
    const res = await fetch(`${API_BASE}/requests/${id}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  acceptRequest: async (id) => {
    const res = await fetch(`${API_BASE}/requests/${id}/accept`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return res.json();
  },

  fulfillRequest: async (id) => {
    const res = await fetch(`${API_BASE}/requests/${id}/fulfill`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return res.json();
  },

  cancelRequest: async (id) => {
    const res = await fetch(`${API_BASE}/requests/${id}/cancel`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return res.json();
  },

  // Admin
  getAdminStats: async () => {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getHeaders()
    });
    return res.json();
  },

  toggleUserVerification: async (userId) => {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/verify`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return res.json();
  }
};
