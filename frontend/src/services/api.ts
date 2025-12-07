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
};

