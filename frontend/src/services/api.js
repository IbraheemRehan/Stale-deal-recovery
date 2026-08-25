/**
 * Stale Deal Recovery API Client
 */

const BASE_URL = '/api';

async function handleResponse(res) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = json?.error?.message || json?.message || `HTTP ${res.status} Error`;
    throw new Error(errorMsg);
  }
  return json;
}

export const api = {
  // Analytics
  getDashboard: async () => {
    const res = await fetch(`${BASE_URL}/analytics/dashboard`);
    return handleResponse(res);
  },

  // Deals
  getDeals: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/deals${query ? `?${query}` : ''}`);
    return handleResponse(res);
  },

  getDealById: async (id) => {
    const res = await fetch(`${BASE_URL}/deals/${id}`);
    return handleResponse(res);
  },

  createDeal: async (dealData) => {
    const res = await fetch(`${BASE_URL}/deals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dealData)
    });
    return handleResponse(res);
  },

  touchDeal: async (id, payload = {}) => {
    const res = await fetch(`${BASE_URL}/deals/${id}/touch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  escalateDeal: async (id, reason) => {
    const res = await fetch(`${BASE_URL}/deals/${id}/escalate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    return handleResponse(res);
  },

  triggerStaleScan: async () => {
    const res = await fetch(`${BASE_URL}/deals/scan-stale`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(res);
  },

  clearAllData: async () => {
    const res = await fetch(`${BASE_URL}/deals/clear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(res);
  },

  // Auto-Tasks
  getTasks: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/tasks${query ? `?${query}` : ''}`);
    return handleResponse(res);
  },

  completeTask: async (id, resolution) => {
    const res = await fetch(`${BASE_URL}/tasks/${id}/complete`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution })
    });
    return handleResponse(res);
  },

  // Sales Reps
  getReps: async () => {
    const res = await fetch(`${BASE_URL}/reps`);
    return handleResponse(res);
  },

  addRep: async (repData) => {
    const res = await fetch(`${BASE_URL}/reps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(repData)
    });
    return handleResponse(res);
  },

  updateRep: async (id, updateData) => {
    const res = await fetch(`${BASE_URL}/reps/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    return handleResponse(res);
  },

  deleteRep: async (id) => {
    const res = await fetch(`${BASE_URL}/reps/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  }
};
