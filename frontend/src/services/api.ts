import { auth } from '../firebase';
import { getIdToken } from 'firebase/auth';

const API_URL = 'http://localhost:5000/api';

// Helper to get token
const getAuthHeader = async () => {
  const user = auth.currentUser;
  if (user) {
    const token = await getIdToken(user);
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

export const api = {
  // Create Link
  createLink: async (data: {
    originalUrl: string;
    customSlug?: string;
    expiresAt?: string;
    maxClicks?: number;
    password?: string;
  }) => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      } as HeadersInit,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create link');
    }
    return res.json();
  },

  // Check Link
  checkLink: async (slug: string) => {
    const res = await fetch(`${API_URL}/link/${slug}`);
    if (!res.ok) {
      if (res.status === 404) throw new Error('Link not found');
      if (res.status === 410) throw new Error('Link expired or limit reached');
      const error = await res.json();
      throw new Error(error.error || 'Failed to check link');
    }
    return res.json();
  },

  // Unlock Link
  unlockLink: async (slug: string, password: string) => {
    const res = await fetch(`${API_URL}/link/${slug}/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to unlock link');
    }
    return res.json();
  },

  // Get User Links (Dashboard)
  getUserLinks: async () => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/dashboard`, {
      headers: {
        ...headers,
      } as HeadersInit,
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to fetch links');
    }
    return res.json();
  },

  // Delete Link
  deleteLink: async (id: string) => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/link/${id}`, {
      method: 'DELETE',
      headers: {
        ...headers,
      } as HeadersInit,
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to delete link');
    }
    return res.json();
  },

  // ============ ADMIN ENDPOINTS ============

  // Get all users (Admin only)
  getAllUsers: async () => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/admin/users`, {
      headers: {
        ...headers,
      } as HeadersInit,
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to fetch users');
    }
    return res.json();
  },

  // Get all links (Admin only)
  getAllLinks: async () => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/admin/links`, {
      headers: {
        ...headers,
      } as HeadersInit,
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to fetch links');
    }
    return res.json();
  },

  // Delete user (Admin only)
  deleteUser: async (uid: string) => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/admin/users/${uid}`, {
      method: 'DELETE',
      headers: {
        ...headers,
      } as HeadersInit,
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to delete user');
    }
    return res.json();
  },

  // Admin delete any link (Admin only)
  adminDeleteLink: async (slug: string) => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/admin/links/${slug}`, {
      method: 'DELETE',
      headers: {
        ...headers,
      } as HeadersInit,
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to delete link');
    }
    return res.json();
  },

  // Get admin stats
  getAdminStats: async () => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/admin/stats`, {
      headers: {
        ...headers,
      } as HeadersInit,
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to fetch stats');
    }
    return res.json();
  },

  // Get user details with all their links (Admin only)
  getAdminUserDetails: async (userId: string) => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/admin/users/${userId}/details`, {
      headers: {
        ...headers,
      } as HeadersInit,
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to fetch user details');
    }
    return res.json();
  },

  // Get single link details (Admin only)
  getAdminLinkDetails: async (linkId: string) => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/admin/links/${linkId}/details`, {
      headers: {
        ...headers,
      } as HeadersInit,
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to fetch link details');
    }
    return res.json();
  },

  // Update link (Admin only)
  updateAdminLink: async (linkId: string, data: {
    targetUrl?: string;
    ttlMinutes?: number | null;
    maxClicks?: number | null;
    password?: string | null;
    allowedDomain?: string | null;
  }) => {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/admin/links/${linkId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      } as HeadersInit,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to update link');
    }
    return res.json();
  },
};

