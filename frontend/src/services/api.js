const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('volosphere_token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const api = {
  // Auth
  auth: {
    login: async (email, password) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return handleResponse(res);
    },
    register: async (volunteerData) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(volunteerData)
      });
      return handleResponse(res);
    },
    me: async () => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },

  // Public/Shared
  opportunities: {
    list: async () => {
      const res = await fetch(`${API_BASE}/opportunities`);
      return handleResponse(res);
    }
  },

  // Volunteer
  volunteer: {
    getProfile: async () => {
      const res = await fetch(`${API_BASE}/volunteer/profile`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    updateProfile: async (profileData) => {
      const res = await fetch(`${API_BASE}/volunteer/profile`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(profileData)
      });
      return handleResponse(res);
    },
    getApplications: async () => {
      const res = await fetch(`${API_BASE}/volunteer/applications`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    apply: async (opportunityId) => {
      const res = await fetch(`${API_BASE}/volunteer/applications`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ opportunityId })
      });
      return handleResponse(res);
    }
  },

  // Admin
  admin: {
    getStats: async () => {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    listVolunteers: async () => {
      const res = await fetch(`${API_BASE}/admin/volunteers`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    updateVolunteerStatus: async (id, status) => {
      const res = await fetch(`${API_BASE}/admin/volunteers/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      return handleResponse(res);
    },
    updateVolunteer: async (id, volunteerData) => {
      const res = await fetch(`${API_BASE}/admin/volunteers/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(volunteerData)
      });
      return handleResponse(res);
    },
    listApplications: async () => {
      const res = await fetch(`${API_BASE}/admin/applications`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    updateApplication: async (id, status, hoursLogged) => {
      const res = await fetch(`${API_BASE}/admin/applications/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status, hoursLogged })
      });
      return handleResponse(res);
    },
    createOpportunity: async (oppData) => {
      const res = await fetch(`${API_BASE}/admin/opportunities`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(oppData)
      });
      return handleResponse(res);
    },
    updateOpportunity: async (id, oppData) => {
      const res = await fetch(`${API_BASE}/admin/opportunities/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(oppData)
      });
      return handleResponse(res);
    },
    deleteOpportunity: async (id) => {
      const res = await fetch(`${API_BASE}/admin/opportunities/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  }
};
