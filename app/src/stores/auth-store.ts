"use client";

import { create } from "zustand";
import type { User } from "@/lib/types/auth";
import type { ApiResponse } from "@/lib/types/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  fetchUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ userSub: string }>;
  verify: (email: string, code: string) => Promise<{ verified: boolean; user?: User }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
}

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const json: ApiResponse<T> = await res.json();

  if (json.error) {
    throw new Error(json.error.message);
  }

  return json.data as T;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const data = await apiCall<{ user: User }>("/api/auth/me");
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    const data = await apiCall<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    set({ user: data.user, isAuthenticated: true });
  },

  register: async (name: string, email: string, password: string) => {
    const data = await apiCall<{ message: string; userSub: string }>(
      "/api/auth/register",
      {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      }
    );
    return { userSub: data.userSub };
  },

  verify: async (email: string, code: string) => {
    const data = await apiCall<{ verified: boolean; user?: User }>(
      "/api/auth/verify",
      {
        method: "POST",
        body: JSON.stringify({ email, code }),
      }
    );
    if (data.user) {
      set({ user: data.user, isAuthenticated: true });
    }
    return data;
  },

  logout: async () => {
    await apiCall("/api/auth/logout", { method: "POST" });
    set({ user: null, isAuthenticated: false });
  },

  forgotPassword: async (email: string) => {
    await apiCall("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (email: string, code: string, newPassword: string) => {
    await apiCall("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, code, newPassword }),
    });
  },
}));
