import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../services/api";
import type { AuthUser, AuthResponse } from "../types/auth";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: AuthUser) => void;
  setToken: (token: string) => void;
  init: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        const response = await api.post<AuthResponse>("/auth/login", {
          email,
          password,
        });
        const { accessToken, user } = response.data;
        localStorage.setItem("accessToken", accessToken);
        set({
          token: accessToken,
          user: {
            id: user.profile.id,
            email: email,
            profile: user.profile,
          },
          isAuthenticated: true,
        });
      },
      logout: () => {
        localStorage.removeItem("accessToken");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
      setUser: (user: AuthUser) => set({ user }),
      setToken: (token: string) => {
        localStorage.setItem("accessToken", token);
        set({ token, isAuthenticated: true });
      },
      init: () => {
        const token = localStorage.getItem("accessToken");
        if (token) {
          set({ token, isAuthenticated: true });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
