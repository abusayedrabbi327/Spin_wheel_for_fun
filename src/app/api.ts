/**
 * API Client for SpinWheel Backend
 * Handles all API calls to the Vercel serverless functions
 */

import { logout } from "./auth";

// @ts-ignore - Vite env
const API_BASE = (import.meta.env?.VITE_API_URL as string) || "/api";

interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// Token management
const getToken = (): string | null => {
  return localStorage.getItem("spinwheel_token");
};

export const setToken = (token: string): void => {
  localStorage.setItem("spinwheel_token", token);
};

export const clearToken = (): void => {
  localStorage.removeItem("spinwheel_token");
};

// Generic fetch wrapper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const contentType = response.headers.get("content-type") || "";
    const responseData = contentType.includes("application/json")
      ? await response.json()
      : null;

    if (response.status === 401) {
      logout();
    }

    if (!response.ok) {
      return {
        success: false,
        error: responseData?.error || `HTTP Error: ${response.status}`,
      };
    }

    return {
      success: true,
      data: responseData?.data !== undefined ? responseData.data : responseData,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

// ==================== AUTH API ====================

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export const authApi = {
  login: async (email: string, password: string) => {
    const result = await apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (result.success && result.data?.token) {
      setToken(result.data.token);
    }

    return result;
  },

  register: async (email: string, password: string, name?: string) => {
    const result = await apiRequest<LoginResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });

    if (result.success && result.data?.token) {
      setToken(result.data.token);
    }

    return result;
  },

  me: async () => {
    return apiRequest<{ user: User }>("/auth/me");
  },

  logout: () => {
    clearToken();
  },
};

// ==================== WHEELS API ====================

export interface WheelItem {
  id: string;
  label: string;
  value: string | null;
  order: number;
}

export interface Wheel {
  id: string;
  title: string;
  slug: string;
  type: "NAMES" | "NUMBERS" | "DECISIONS" | "PRIZES" | "FOOD" | "CUSTOM";
  maxSpins: number | null;
  expiryDate: string | null;
  allowBetterLuck: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items: WheelItem[];
  _count?: {
    spins: number;
  };
}

export interface CreateWheelData {
  title: string;
  type?: string;
  maxSpins?: number;
  expiryDate?: string;
  allowBetterLuck?: boolean;
  items: { label: string; value?: string }[];
}

export const wheelsApi = {
  // Get all user's wheels
  list: async () => {
    return apiRequest<Wheel[]>("/wheels");
  },

  // Get single wheel by ID
  get: async (id: string) => {
    return apiRequest<Wheel>(`/wheels/${id}`);
  },

  // Get public wheel by slug
  getPublic: async (slug: string) => {
    return apiRequest<Wheel>(`/wheels/public/${slug}`);
  },

  // Create new wheel
  create: async (data: CreateWheelData) => {
    return apiRequest<Wheel>("/wheels", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update wheel
  update: async (id: string, data: Partial<CreateWheelData>) => {
    return apiRequest<Wheel>(`/wheels/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete wheel
  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/wheels/${id}`, {
      method: "DELETE",
    });
  },
};

// ==================== SPINS API ====================

export interface Spin {
  id: string;
  wheelId: string;
  result: string;
  participantName: string;
  participantPhone?: string;
  createdAt: string;
}

export interface SpinsListResponse {
  spins: Spin[];
  total: number;
  limit: number;
  offset: number;
}

export const spinsApi = {
  // Record a new spin
  record: async (wheelId: string, result: string, spinnerName?: string, spinnerEmail?: string) => {
    return apiRequest<Spin>("/spins", {
      method: "POST",
      body: JSON.stringify({ wheelId, result, spinnerName, spinnerEmail }),
    });
  },

  // Get spins for a wheel (owner only)
  list: async (wheelId: string, limit = 50, offset = 0) => {
    return apiRequest<SpinsListResponse>(`/spins?wheelId=${wheelId}&limit=${limit}&offset=${offset}`);
  },
};

// ==================== ADMIN API ====================

export interface AdminStats {
  overview: {
    totalUsers: number;
    totalWheels: number;
    totalSpins: number;
    activeWheels: number;
  };
  recent: {
    users: number;
    wheels: number;
    spins: number;
  };
  spinsPerDay: Record<string, number>;
  topWheels: {
    id: string;
    title: string;
    slug: string;
    owner: string;
    spins: number;
    isActive: boolean;
  }[];
  wheelTypes?: {
    type: string;
    count: number;
  }[];
}

export interface AdminUser extends User {
  wheelCount: number;
  totalSpins: number;
}

export interface AdminWheel {
  id: string;
  title: string;
  slug: string;
  type: string;
  isActive: boolean;
  itemCount: number;
  allowBetterLuck: boolean;
  createdAt: string;
  totalSpins: number;
  owner: {
    _id: string;
    name: string | null;
    email: string;
  } | null;
}

export interface AdminWheelsResponse {
  wheels: AdminWheel[];
  total: number;
  limit: number;
  offset: number;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  limit: number;
  offset: number;
}

export const adminApi = {
  // Get admin stats
  getStats: async () => {
    return apiRequest<AdminStats>("/admin/stats");
  },

  // Get all users
  getUsers: async (limit = 20, offset = 0, search?: string) => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      ...(search && { search }),
    });
    return apiRequest<AdminUsersResponse>(`/admin/users?${params}`);
  },

  // Get all wheels
  getWheels: async (limit = 20, offset = 0, search?: string, status = "All") => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      ...(search && { search }),
      ...(status && status !== "All" && { status }),
    });
    return apiRequest<AdminWheelsResponse>(`/admin/wheels?${params}`);
  },

  // Update user role
  updateUserRole: async (userId: string, role: "USER" | "ADMIN") => {
    return apiRequest<User>(`/admin/users?id=${userId}`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    });
  },

  // Delete user
  deleteUser: async (userId: string) => {
    return apiRequest<{ message: string }>(`/admin/users?id=${userId}`, {
      method: "DELETE",
    });
  },
};

export default {
  auth: authApi,
  wheels: wheelsApi,
  spins: spinsApi,
  admin: adminApi,
};
