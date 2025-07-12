import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User, LoginRequest, AuthState } from "@/types/auth";

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const isAuthenticated = computed(() => !!user.value && !!token.value);

  // Simulated user data
  const MOCK_USER: User = {
    id: "user_123456",
    email: "vj5@gmail.com",
    name: "VJ Admin",
    role: "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Actions
  const login = async (credentials: LoginRequest): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check credentials
      if (
        credentials.email === "vj5@gmail.com" &&
        credentials.password === "123456"
      ) {
        // Successful login
        user.value = MOCK_USER;
        token.value = `mock_token_${Date.now()}`;

        // Store in localStorage for persistence
        localStorage.setItem("auth_token", token.value);
        localStorage.setItem("auth_user", JSON.stringify(user.value));

        console.log("✅ Login successful:", user.value);
      } else {
        // Invalid credentials
        throw new Error("Invalid email or password");
      }
    } catch (err: any) {
      error.value = err.message || "Login failed";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async (): Promise<void> => {
    isLoading.value = true;

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Clear state
      user.value = null;
      token.value = null;
      error.value = null;

      // Clear localStorage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");

      console.log("✅ Logout successful");
    } catch (err: any) {
      error.value = err.message || "Logout failed";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const initializeAuth = (): void => {
    // Try to restore authentication from localStorage
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (storedToken && storedUser) {
      try {
        token.value = storedToken;
        user.value = JSON.parse(storedUser);
        console.log("✅ Auth restored from localStorage:", user.value);
      } catch (err) {
        console.error("❌ Failed to restore auth from localStorage:", err);
        // Clear invalid data
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    }
  };

  const clearError = (): void => {
    error.value = null;
  };

  return {
    // State
    user,
    token,
    isLoading,
    error,
    // Computed
    isAuthenticated,
    // Actions
    login,
    logout,
    initializeAuth,
    clearError,
  };
});
