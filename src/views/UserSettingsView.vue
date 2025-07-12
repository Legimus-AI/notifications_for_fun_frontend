<template>
  <div class="user-settings-container">
    <PageHeader
      title="User Settings"
      subtitle="Manage your account settings and preferences"
      :breadcrumbs="breadcrumbs"
    />

    <div class="settings-content">
      <!-- Profile Information -->
      <div class="settings-section">
        <div class="section-header">
          <h3>Profile Information</h3>
          <p>Your account details and information</p>
        </div>

        <div class="profile-info">
          <div class="info-item">
            <label>Email Address</label>
            <div class="info-value">
              <font-awesome-icon
                :icon="['fas', 'envelope']"
                class="info-icon"
              />
              <span>{{ user?.email || "Not available" }}</span>
            </div>
          </div>

          <div class="info-item">
            <label>Role</label>
            <div class="info-value">
              <font-awesome-icon
                :icon="['fas', 'user-tag']"
                class="info-icon"
              />
              <span class="role-badge" :class="getRoleClass(userRole)">
                {{ userRole }}
              </span>
            </div>
          </div>

          <div class="info-item">
            <label>Member Since</label>
            <div class="info-value">
              <font-awesome-icon
                :icon="['fas', 'calendar']"
                class="info-icon"
              />
              <span>{{ formatDate(user?.created_at) }}</span>
            </div>
          </div>

          <div class="info-item">
            <label>Last Sign In</label>
            <div class="info-value">
              <font-awesome-icon :icon="['fas', 'clock']" class="info-icon" />
              <span>{{
                user?.last_sign_in_at
                  ? formatDate(user.last_sign_in_at)
                  : "Never"
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Password Change -->
      <div class="settings-section">
        <div class="section-header">
          <h3>Change Password</h3>
          <p>Update your account password for security</p>
        </div>

        <form @submit.prevent="handlePasswordChange" class="password-form">
          <div class="form-group">
            <label for="newPassword">New Password</label>
            <div class="input-wrapper">
              <input
                id="newPassword"
                v-model="passwordForm.newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="Enter new password"
                required
                minlength="6"
                :disabled="isUpdating"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showNewPassword = !showNewPassword"
                :disabled="isUpdating"
              >
                <font-awesome-icon
                  :icon="
                    showNewPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']
                  "
                />
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm New Password</label>
            <div class="input-wrapper">
              <input
                id="confirmPassword"
                v-model="passwordForm.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="Confirm new password"
                required
                minlength="6"
                :disabled="isUpdating"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showConfirmPassword = !showConfirmPassword"
                :disabled="isUpdating"
              >
                <font-awesome-icon
                  :icon="
                    showConfirmPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']
                  "
                />
              </button>
            </div>
          </div>

          <!-- Password Requirements -->
          <div class="password-requirements">
            <p class="requirements-title">Password Requirements:</p>
            <ul class="requirements-list">
              <li :class="{ valid: passwordForm.newPassword.length >= 6 }">
                <font-awesome-icon
                  :icon="
                    passwordForm.newPassword.length >= 6
                      ? ['fas', 'check']
                      : ['fas', 'times']
                  "
                />
                At least 6 characters
              </li>
              <li :class="{ valid: passwordsMatch }">
                <font-awesome-icon
                  :icon="passwordsMatch ? ['fas', 'check'] : ['fas', 'times']"
                />
                Passwords match
              </li>
            </ul>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="error-message">
            <font-awesome-icon :icon="['fas', 'exclamation-triangle']" />
            {{ error }}
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isUpdating || !canUpdatePassword"
            >
              <font-awesome-icon
                v-if="isUpdating"
                :icon="['fas', 'spinner']"
                class="spinning"
              />
              <font-awesome-icon v-else :icon="['fas', 'key']" />
              {{ isUpdating ? "Updating..." : "Update Password" }}
            </button>

            <button
              type="button"
              class="btn btn-secondary"
              @click="resetForm"
              :disabled="isUpdating"
            >
              <font-awesome-icon :icon="['fas', 'times']" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/store/auth";
import { useToast } from "@/composables/useToast";
import { storeToRefs } from "pinia";
import PageHeader from "@/components/layout/PageHeader.vue";

const authStore = useAuthStore();
const { success, error: showError } = useToast();

// Refs from store
const { user, isLoading, error, userRole } = storeToRefs(authStore);

// Component state
const isUpdating = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const passwordForm = ref({
  newPassword: "",
  confirmPassword: "",
});

const breadcrumbs = ref([
  { label: "Dashboard", href: "/" },
  { label: "Settings", href: "/settings" },
]);

// Computed
const passwordsMatch = computed(() => {
  return (
    passwordForm.value.newPassword === passwordForm.value.confirmPassword &&
    passwordForm.value.confirmPassword.length > 0
  );
});

const canUpdatePassword = computed(() => {
  return (
    passwordForm.value.newPassword.length >= 6 &&
    passwordsMatch.value &&
    !isUpdating.value
  );
});

// Methods
const handlePasswordChange = async () => {
  if (!canUpdatePassword.value) return;

  isUpdating.value = true;

  try {
    await authStore.updatePassword(passwordForm.value.newPassword);
    success("Password updated successfully!", "Success");
    resetForm();
  } catch (err: any) {
    showError(err.message || "Failed to update password", "Error");
  } finally {
    isUpdating.value = false;
  }
};

const resetForm = () => {
  passwordForm.value = {
    newPassword: "",
    confirmPassword: "",
  };
  showNewPassword.value = false;
  showConfirmPassword.value = false;
  authStore.clearError();
};

const getRoleClass = (role: string) => {
  switch (role) {
    case "superadmin":
      return "role-superadmin";
    case "admin":
      return "role-admin";
    default:
      return "role-user";
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "Not available";

  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

onMounted(() => {
  authStore.clearError();
});
</script>

<style scoped>
.user-settings-container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
}

.section-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 0.5rem 0;
}

.section-header p {
  color: var(--color-text-secondary);
  margin: 0;
}

.profile-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item label {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.info-value {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border-radius: 8px;
  color: var(--color-text-secondary);
}

.info-icon {
  color: var(--color-primary);
  font-size: 0.875rem;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.role-superadmin {
  background: #fee2e2;
  color: #991b1b;
}

.role-admin {
  background: #fef3c7;
  color: #92400e;
}

.role-user {
  background: #e0f2fe;
  color: #0277bd;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
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
  right: 0.75rem;
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

.password-requirements {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
}

.requirements-title {
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
}

.requirements-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.requirements-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.requirements-list li.valid {
  color: #059669;
}

.requirements-list li svg {
  font-size: 0.75rem;
}

.error-message {
  background: linear-gradient(45deg, #fee2e2, #fecaca);
  color: #991b1b;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  border: 1px solid #fecaca;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(45deg, var(--color-primary), #1d4ed8);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: #f3f4f6;
  color: var(--color-text-primary);
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn:disabled {
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

@media (max-width: 768px) {
  .user-settings-container {
    padding: 1rem;
  }

  .profile-info {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
