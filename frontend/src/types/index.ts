export type UserRole = 'user' | 'admin';

export interface IUser {
  _id: string; // This corresponds to Firebase UID
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface ILink {
  _id: string; // The slug (e.g., "xy9zK1")
  originalUrl: string;
  ownerId: string; // or userId, consistent with backend
  
  // Stats
  clickCount: number;
  
  // Security Settings (Matches Backend Schema)
  security: {
    type: 'none' | 'password' | 'domain_lock';
    password?: string | null;      // Only if type='password'
    allowedDomain?: string | null; // Only if type='domain_lock'
    expiresAt?: string | null;
    maxClicks?: number | null;
  };

  // Admin / Analysis
  threatLevel?: 'safe' | 'suspicious' | 'unsafe';
  
  // Timestamps
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  } | string; // Firestore timestamp or ISO string depending on how you fetch
}

export interface IAuthResponse {
  token: string;
  user: IUser;
}