import api from "./api";
import type { AuthResponse, RegisterPayload } from "@/types";

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post("/users/login", { email, password });
    localStorage.setItem("mrfit_token", data.token);
    return data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await api.post("/users/register", payload);
    return data;
  },

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const { data } = await api.get(`/users/verify?token=${token}`);
    return data;
  },

  getProfile: async () => {
    const { data } = await api.get("/users/me");
    return data;
  },

  updateProfile: async (payload: Record<string, unknown>) => {
    const { data } = await api.put("/users/profile", payload);
    return data;
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    const { data } = await api.put("/users/password", {
      currentPassword,
      newPassword,
    });
    return data;
  },

  forgotPassword: async (email: string) => {
    const { data } = await api.post("/users/forgot-password", { email });
    return data;
  },

  logout: () => {
    localStorage.removeItem("mrfit_token");
    window.location.href = "/login";
  },

  isAuthenticated: () => !!localStorage.getItem("mrfit_token"),
};
