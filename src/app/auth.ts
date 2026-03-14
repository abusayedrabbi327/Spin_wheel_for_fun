// Simple auth utility for managing user authentication state
// In production, this would be replaced with proper JWT/session-based auth

export type UserRole = "admin" | "user" | null;

interface UserInfo {
  id?: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  email: string | null;
  user?: UserInfo;
}

const AUTH_KEY = "spinwheel_auth";

function hasToken(): boolean {
  return Boolean(localStorage.getItem("spinwheel_token"));
}

export function getAuthState(): AuthState {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<AuthState>;
      const safeRole: UserRole = parsed.role === "admin" || parsed.role === "user" ? parsed.role : null;
      return {
        isAuthenticated: parsed.isAuthenticated === true,
        role: safeRole,
        email: typeof parsed.email === "string" ? parsed.email : null,
        user: parsed.user,
      };
    }
  } catch {
    // Invalid stored data
  }
  return { isAuthenticated: false, role: null, email: null };
}

export function setAuthState(state: AuthState): void {
  const role: UserRole = state.role === "admin" || state.role === "user" ? state.role : null;
  localStorage.setItem(
    AUTH_KEY,
    JSON.stringify({
      ...state,
      role,
      isAuthenticated: state.isAuthenticated === true,
    })
  );
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem("spinwheel_token");
}

export function isAdmin(): boolean {
  if (!hasToken()) return false;
  const role = getAuthState().role;
  return role === "admin" || (role as string) === "ADMIN";
}

export function isAuthenticated(): boolean {
  if (!hasToken()) return false;
  const state = getAuthState();
  return state.isAuthenticated === true;
}
