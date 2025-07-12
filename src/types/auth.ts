import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface User extends SupabaseUser {
  // Add any custom fields if needed
  name?: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  ok: boolean;
  user?: User;
  token?: string;
  message?: string;
  error?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
