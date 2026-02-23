// Simple auth utility for managing user authentication state
// In production, this would be replaced with proper JWT/session-based auth

export type UserRole = "admin" | "user" | null;

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  email: string | null;
}

const AUTH_KEY = "spinwheel_auth";

// Fixed admin credentials
export const ADMIN_EMAIL = "abusayed102188@gmail.com";
export const ADMIN_PASSWORD = "sayed@admin_327";

export function getAuthState(): AuthState {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Invalid stored data
  }
  return { isAuthenticated: false, role: null, email: null };
}

export function login(email: string, password: string): { success: boolean; role: UserRole } {
  // Check if admin
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const state: AuthState = { isAuthenticated: true, role: "admin", email };
    localStorage.setItem(AUTH_KEY, JSON.stringify(state));
    return { success: true, role: "admin" };
  }
  
  // Regular user - accept any credentials for demo
  if (email && password) {
    const state: AuthState = { isAuthenticated: true, role: "user", email };
    localStorage.setItem(AUTH_KEY, JSON.stringify(state));
    return { success: true, role: "user" };
  }
  
  return { success: false, role: null };
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function isAdmin(): boolean {
  return getAuthState().role === "admin";
}

export function isAuthenticated(): boolean {
  return getAuthState().isAuthenticated;
}
