<template>
  <div class="auth-callback-container">
    <div class="auth-callback-card">
      <div class="auth-callback-content">
        <div v-if="isLoading" class="loading-state">
          <font-awesome-icon :icon="['fas', 'spinner']" class="spinner" />
          <h2>Authenticating...</h2>
          <p>Please wait while we complete your authentication.</p>
        </div>

        <div v-else-if="error" class="error-state">
          <font-awesome-icon
            :icon="['fas', 'exclamation-triangle']"
            class="error-icon"
          />
          <h2>Authentication Failed</h2>
          <p>{{ error }}</p>
          <button @click="goToLogin" class="retry-button">
            <font-awesome-icon :icon="['fas', 'arrow-left']" />
            Back to Login
          </button>
        </div>

        <div v-else class="success-state">
          <font-awesome-icon
            :icon="['fas', 'check-circle']"
            class="success-icon"
          />
          <h2>Authentication Successful!</h2>
          <p>You will be redirected to the dashboard shortly.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { useToast } from "@/composables/useToast";
import { supabase } from "@/supabase";

const router = useRouter();
const authStore = useAuthStore();
const { success, error: showError } = useToast();

const isLoading = ref(true);
const error = ref<string | null>(null);

const handleAuthCallback = async () => {
  try {
    // Handle the auth callback
    const { data, error: authError } = await supabase.auth.getSession();

    if (authError) {
      throw authError;
    }

    if (data.session) {
      // User is authenticated
      success("Authentication successful! Welcome back.", "Success");

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } else {
      throw new Error("No session found");
    }
  } catch (err: any) {
    error.value = err.message || "Authentication failed";
    showError(error.value, "Error");
  } finally {
    isLoading.value = false;
  }
};

const goToLogin = () => {
  router.push("/login");
};

onMounted(() => {
  handleAuthCallback();
});
</script>

<style scoped>
.auth-callback-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
}

.auth-callback-card {
  background: white;
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  max-width: 400px;
  width: 100%;
}

.auth-callback-content {
  text-align: center;
}

.loading-state,
.error-state,
.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  font-size: 3rem;
  color: var(--color-primary);
  animation: spin 1s linear infinite;
}

.error-icon {
  font-size: 3rem;
  color: #dc2626;
}

.success-icon {
  font-size: 3rem;
  color: #10b981;
}

h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

p {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

.retry-button {
  background: linear-gradient(45deg, var(--color-primary), #1d4ed8);
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
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
