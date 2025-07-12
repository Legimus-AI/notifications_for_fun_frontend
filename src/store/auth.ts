import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/supabase";
import type { User } from "@supabase/supabase-js";

// Update type imports if necessary
import type { LoginRequest, AuthState } from "@/types/auth";

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<User | null>(null);
  const isLoading = ref(true); // Start as loading
  const error = ref<string | null>(null);

  // Computed
  const isAuthenticated = computed(() => !!user.value);
  const userRole = computed(() => user.value?.user_metadata?.role || "user");
  const isSuperAdmin = computed(() => userRole.value === "superadmin");

  // Actions
  const loginWithPassword = async (
    credentials: LoginRequest
  ): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email: credentials.email,
          password: credentials.password,
        }
      );

      if (authError) throw authError;
      user.value = data.user;

      console.log("✅ Login successful:", user.value);
    } catch (err: any) {
      error.value = err.message || "Login failed";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const loginWithMagicLink = async (email: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (authError) throw authError;
      console.log("✅ Magic link sent to:", email);
    } catch (err: any) {
      error.value = err.message || "Failed to send magic link";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const createUser = async (
    email: string,
    password: string,
    role: string = "user"
  ): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role,
          },
        },
      });

      if (authError) throw authError;
      console.log("✅ User created:", data.user);
    } catch (err: any) {
      error.value = err.message || "Failed to create user";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updatePassword = async (newPassword: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (authError) throw authError;
      console.log("✅ Password updated successfully");
    } catch (err: any) {
      error.value = err.message || "Failed to update password";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async (): Promise<void> => {
    isLoading.value = true;

    try {
      const { error: authError } = await supabase.auth.signOut();
      if (authError) throw authError;
      user.value = null;
      error.value = null;

      console.log("✅ Logout successful");
    } catch (err: any) {
      error.value = err.message || "Logout failed";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const initializeAuth = async (): Promise<void> => {
    try {
      isLoading.value = true;

      // Get current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("❌ Session error:", sessionError);
        throw sessionError;
      }

      user.value = session?.user ?? null;

      console.log(
        "✅ Auth initialized:",
        user.value
          ? `authenticated as ${user.value.email}`
          : "not authenticated"
      );
    } catch (error) {
      console.error("❌ Auth initialization failed:", error);
      user.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  // Listen for auth state changes
  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null;
    console.log(
      "🔄 Auth state changed:",
      user.value ? `authenticated as ${user.value.email}` : "not authenticated"
    );
  });

  const clearError = (): void => {
    error.value = null;
  };

  return {
    // State
    user,
    isLoading,
    error,
    // Computed
    isAuthenticated,
    userRole,
    isSuperAdmin,
    // Actions
    loginWithPassword,
    loginWithMagicLink,
    createUser,
    updatePassword,
    logout,
    initializeAuth,
    clearError,
  };
});
