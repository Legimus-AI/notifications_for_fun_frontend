<template>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="login-card">
        <!-- Header -->
        <div class="login-header">
          <div class="logo">
            <font-awesome-icon :icon="['fas', 'comments']" class="logo-icon" />
            <h1 class="logo-text">Notifications</h1>
          </div>
          <p class="login-subtitle">Sign in to your account</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="login-form">
          <!-- Email Field -->
          <div class="form-group">
            <label for="email" class="form-label">
              <font-awesome-icon :icon="['fas', 'user']" class="label-icon" />
              Email Address
            </label>
            <div class="input-wrapper">
              <input
                id="email"
                v-model="credentials.email"
                type="email"
                class="form-input"
                placeholder="Enter your email"
                required
                :disabled="isLoading"
              />
            </div>
          </div>

          <!-- Password Field (only for password auth) -->
          <div v-if="!useMagicLink" class="form-group">
            <label for="password" class="form-label">
              <font-awesome-icon :icon="['fas', 'lock']" class="label-icon" />
              Password
            </label>
            <div class="input-wrapper">
              <input
                id="password"
                v-model="credentials.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="Enter your password"
                required
                :disabled="isLoading"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
                :disabled="isLoading"
              >
                <font-awesome-icon
                  :icon="showPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']"
                />
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="error-message">
            <font-awesome-icon :icon="['fas', 'exclamation-triangle']" />
            {{ error }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="login-button"
            :disabled="
              isLoading ||
              !credentials.email ||
              (!useMagicLink && !credentials.password)
            "
          >
            <font-awesome-icon
              v-if="isLoading"
              :icon="['fas', 'spinner']"
              class="spinning"
            />
            <font-awesome-icon v-else :icon="['fas', 'sign-in-alt']" />
            {{ getButtonText() }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { useToast } from "@/composables/useToast";
import { storeToRefs } from "pinia";

const router = useRouter();
const authStore = useAuthStore();
const { success, error: showError } = useToast();

// Refs from store
const { isLoading, error } = storeToRefs(authStore);

// Component state
const credentials = ref({
  email: "",
  password: "",
});
const showPassword = ref(false);
const useMagicLink = ref(false);

// Methods
const handleLogin = async () => {
  try {
    if (useMagicLink.value) {
      await authStore.loginWithMagicLink(credentials.value.email);
      success("Magic link sent! Check your email.", "Success");
    } else {
      await authStore.loginWithPassword(credentials.value);
      success("Login successful! Welcome back.", "Success");
      router.push("/");
    }
  } catch (err: any) {
    showError(err.message || "Login failed", "Error");
  }
};

const getButtonText = () => {
  if (isLoading.value) {
    return useMagicLink.value ? "Sending magic link..." : "Signing in...";
  }
  return useMagicLink.value ? "Send Magic Link" : "Sign In";
};

const fillDemoCredentials = () => {
  credentials.value = {
    email: "",
    password: "",
  };
};

// Clear error when component unmounts
onMounted(() => {
  authStore.clearError();
  // Pre-fill demo credentials for convenience
  fillDemoCredentials();
});
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
}

.login-wrapper {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: white;
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.logo-icon {
  font-size: 2rem;
  color: var(--color-primary);
}

.logo-text {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-text-primary);
  margin: 0;
}

.login-subtitle {
  color: var(--color-text-secondary);
  font-size: 1rem;
  margin: 0;
}

.auth-toggle {
  display: flex;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 0.25rem;
  margin-bottom: 2rem;
  gap: 0.25rem;
}

.toggle-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #6b7280;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.toggle-btn.active {
  background: white;
  color: var(--color-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label-icon {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  color: var(--color-text-primary);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.password-toggle {
  position: absolute;
  right: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: var(--color-primary);
}

.password-toggle:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: linear-gradient(45deg, #fee2e2, #fecaca);
  color: #991b1b;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  border: 1px solid #fecaca;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.login-button {
  background: linear-gradient(45deg, var(--color-primary), #1d4ed8);
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
