// src/types/index.ts

export type UserRole = 'user' | 'admin';

export interface IUser {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface ILink {
  _id: string;
  originalUrl: string;
  shortSlug: string;
  userId?: string | null;
  
  // Security Features
  hasPassword?: boolean;
  expiresAt?: string;
  clickCount: number;
  maxClicks?: number; // 0 or null means unlimited
  
  // Admin Features
  threatLevel: 'safe' | 'suspicious' | 'unsafe';
  isActive: boolean;
  
  createdAt: string;
}

export interface IAuthResponse {
  token: string;
  user: IUser;
}