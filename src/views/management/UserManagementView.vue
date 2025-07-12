<template>
  <div class="user-management-container">
    <PageHeader
      title="User Management"
      subtitle="Manage system users and their roles"
      :breadcrumbs="breadcrumbs"
    />

    <div class="user-management-content">
      <!-- Create User Section -->
      <div class="create-user-section">
        <div class="section-header">
          <h3>Create New User</h3>
          <p>Add a new user to the system</p>
        </div>

        <form @submit.prevent="handleCreateUser" class="create-user-form">
          <div class="form-row">
            <div class="form-group">
              <label for="email">Email Address</label>
              <input
                id="email"
                v-model="newUser.email"
                type="email"
                class="form-input"
                placeholder="Enter email address"
                required
                :disabled="isCreating"
              />
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input
                id="password"
                v-model="newUser.password"
                type="password"
                class="form-input"
                placeholder="Enter password"
                required
                :disabled="isCreating"
              />
            </div>

            <div class="form-group">
              <label for="role">Role</label>
              <select
                id="role"
                v-model="newUser.role"
                class="form-select"
                :disabled="isCreating"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isCreating || !newUser.email || !newUser.password"
            >
              <font-awesome-icon
                v-if="isCreating"
                :icon="['fas', 'spinner']"
                class="spinning"
              />
              <font-awesome-icon v-else :icon="['fas', 'user-plus']" />
              {{ isCreating ? "Creating..." : "Create User" }}
            </button>
          </div>
        </form>
      </div>

      <!-- Users List Section -->
      <div class="users-list-section">
        <div class="section-header">
          <h3>System Users</h3>
          <p>View and manage existing users</p>
        </div>

        <div v-if="isLoading" class="loading-state">
          <font-awesome-icon :icon="['fas', 'spinner']" class="spinner" />
          <p>Loading users...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <font-awesome-icon :icon="['fas', 'exclamation-triangle']" />
          <p>{{ error }}</p>
          <button @click="loadUsers" class="btn btn-secondary">
            <font-awesome-icon :icon="['fas', 'refresh']" />
            Retry
          </button>
        </div>

        <div v-else class="users-table-container">
          <table class="users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Last Sign In</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id" class="user-row">
                <td class="user-email">
                  <div class="user-info">
                    <font-awesome-icon
                      :icon="['fas', 'user']"
                      class="user-icon"
                    />
                    <span>{{ user.email }}</span>
                  </div>
                </td>
                <td class="user-role">
                  <span
                    class="role-badge"
                    :class="getRoleClass(user.user_metadata?.role)"
                  >
                    {{ user.user_metadata?.role || "user" }}
                  </span>
                </td>
                <td class="user-created">
                  {{ formatDate(user.created_at) }}
                </td>
                <td class="user-last-sign-in">
                  {{
                    user.last_sign_in_at
                      ? formatDate(user.last_sign_in_at)
                      : "Never"
                  }}
                </td>
                <td class="user-status">
                  <span
                    class="status-badge"
                    :class="user.email_confirmed_at ? 'confirmed' : 'pending'"
                  >
                    {{ user.email_confirmed_at ? "Confirmed" : "Pending" }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/store/auth";
import { useToast } from "@/composables/useToast";
import { supabase } from "@/supabase";
import PageHeader from "@/components/layout/PageHeader.vue";
import type { User } from "@supabase/supabase-js";

const authStore = useAuthStore();
const { success, error: showError } = useToast();

// Component state
const isLoading = ref(false);
const isCreating = ref(false);
const error = ref<string | null>(null);
const users = ref<User[]>([]);

const newUser = ref({
  email: "",
  password: "",
  role: "user",
});

const breadcrumbs = [
  { text: "Management", href: "/management" },
  { text: "User Management", href: "/management/users" },
];

// Methods
const handleCreateUser = async () => {
  isCreating.value = true;
  try {
    await authStore.createUser(
      newUser.value.email,
      newUser.value.password,
      newUser.value.role
    );
    success(`User ${newUser.value.email} created successfully!`, "Success");

    // Reset form
    newUser.value = {
      email: "",
      password: "",
      role: "user",
    };

    // Reload users list
    await loadUsers();
  } catch (err: any) {
    showError(err.message || "Failed to create user", "Error");
  } finally {
    isCreating.value = false;
  }
};

const loadUsers = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const { data, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      throw usersError;
    }

    users.value = data.users || [];
  } catch (err: any) {
    error.value = err.message || "Failed to load users";
    showError(error.value, "Error");
  } finally {
    isLoading.value = false;
  }
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.user-management-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.user-management-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.create-user-section,
.users-list-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 2rem;
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

.create-user-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
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

.form-input,
.form-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled,
.form-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
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

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

.spinner {
  font-size: 2rem;
  color: var(--color-primary);
  animation: spin 1s linear infinite;
}

.users-table-container {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.users-table th,
.users-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.users-table th {
  background: #f9fafb;
  font-weight: 600;
  color: var(--color-text-primary);
}

.user-row:hover {
  background: #f9fafb;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-icon {
  color: var(--color-text-secondary);
}

.role-badge,
.status-badge {
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

.status-badge.confirmed {
  background: #dcfce7;
  color: #166534;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
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
  .form-row {
    grid-template-columns: 1fr;
  }

  .users-table {
    font-size: 0.75rem;
  }

  .users-table th,
  .users-table td {
    padding: 0.5rem;
  }
}
</style>
