<template>
  <div class="sidebar">
    <!-- Brand Header -->
    <div class="sidebar-header">
      <div class="brand-container">
        <div class="brand-icon">
          <font-awesome-icon :icon="['fas', 'bell']" />
        </div>
        <div class="brand-text">
          <h1 class="brand-title">Notifications</h1>
          <p class="brand-subtitle">for fun</p>
        </div>
      </div>
    </div>

    <!-- Main Navigation -->
    <nav class="nav-main">
      <ul class="nav-list">
        <li class="nav-item">
          <router-link to="/" class="nav-link">
            <div class="nav-icon">
              <font-awesome-icon :icon="['fas', 'table-columns']" />
            </div>
            <span>Dashboard</span>
          </router-link>
        </li>

        <!-- Whatsapp Section -->
        <li class="nav-item">
          <button
            @click="toggleWhatsapp"
            class="nav-link nav-toggle"
            :class="{ 'is-open': whatsappOpen }"
          >
            <div class="nav-icon">
              <font-awesome-icon :icon="['fab', 'whatsapp']" />
            </div>
            <span>Whatsapp</span>
            <font-awesome-icon
              :icon="['fas', 'chevron-down']"
              class="toggle-icon"
            />
          </button>
          <ul class="nav-submenu" :class="{ 'is-open': whatsappOpen }">
            <li class="nav-submenu-item">
              <router-link
                to="/whatsapp/messages"
                class="nav-link nav-link--sub"
              >
                <div class="nav-icon">
                  <font-awesome-icon :icon="['fas', 'comments']" />
                </div>
                <span>Messages</span>
              </router-link>
            </li>
          </ul>
        </li>

        <!-- Integrations Section -->
        <li class="nav-item">
          <button
            @click="toggleIntegrations"
            class="nav-link nav-toggle"
            :class="{ 'is-open': integrationsOpen }"
          >
            <div class="nav-icon">
              <font-awesome-icon :icon="['fas', 'puzzle-piece']" />
            </div>
            <span>Integrations</span>
            <font-awesome-icon
              :icon="['fas', 'chevron-down']"
              class="toggle-icon"
            />
          </button>
          <ul class="nav-submenu" :class="{ 'is-open': integrationsOpen }">
            <li class="nav-submenu-item">
              <router-link to="/webhooks" class="nav-link nav-link--sub">
                <div class="nav-icon">
                  <font-awesome-icon :icon="['fas', 'share-nodes']" />
                </div>
                <span>Webhooks</span>
              </router-link>
            </li>
            <li class="nav-submenu-item">
              <router-link
                to="/management/api-keys"
                class="nav-link nav-link--sub"
              >
                <div class="nav-icon">
                  <font-awesome-icon :icon="['fas', 'key']" />
                </div>
                <span>API Keys</span>
              </router-link>
            </li>
            <li class="nav-submenu-item">
              <router-link
                to="/management/phone-numbers"
                class="nav-link nav-link--sub"
              >
                <div class="nav-icon">
                  <font-awesome-icon :icon="['fas', 'phone']" />
                </div>
                <span>Phone Numbers</span>
              </router-link>
            </li>
          </ul>
        </li>
      </ul>
    </nav>

    <!-- User Profile Footer -->
    <div class="sidebar-footer">
      <div class="user-profile">
        <div class="user-avatar">
          <font-awesome-icon :icon="['fas', 'user']" />
        </div>
        <div class="user-info">
          <span class="user-name">{{ user?.name || "Guest" }}</span>
          <span class="user-role">{{ user?.role || "User" }}</span>
        </div>
        <button
          class="user-menu-btn"
          @click="handleLogout"
          :disabled="isLoggingOut"
        >
          <font-awesome-icon
            :icon="isLoggingOut ? ['fas', 'spinner'] : ['fas', 'sign-out-alt']"
            :class="{ spinning: isLoggingOut }"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { useToast } from "@/composables/useToast";
import { storeToRefs } from "pinia";

const router = useRouter();
const authStore = useAuthStore();
const { success, error } = useToast();

// Refs from store
const { user } = storeToRefs(authStore);

// Component state
const integrationsOpen = ref(true);
const whatsappOpen = ref(true);
const isLoggingOut = ref(false);

const toggleIntegrations = () => {
  integrationsOpen.value = !integrationsOpen.value;
};

const toggleWhatsapp = () => {
  whatsappOpen.value = !whatsappOpen.value;
};

const handleLogout = async () => {
  isLoggingOut.value = true;

  try {
    await authStore.logout();
    success("Logged out successfully", "Success");
    router.push("/login");
  } catch (err: any) {
    error(err.message || "Logout failed", "Error");
  } finally {
    isLoggingOut.value = false;
  }
};
</script>

<style scoped>
.sidebar {
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  border-right: 1px solid #475569;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
}

.sidebar::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255,255,255,0.03)'%3e%3cpath d='m0 2 2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2L20 0v2l-2 2-2-2-2 2-2-2-2 2-2-2-2 2-2-2-2 2-2-2-2 2-2-2L0 4z'/%3e%3c/svg%3e");
  pointer-events: none;
}

/* Brand Header */
.sidebar-header {
  padding: 2rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
}

.brand-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-icon {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(45deg, #3b82f6, #1d4ed8);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
  flex-shrink: 0;
}

.brand-text {
  flex: 1;
}

.brand-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.025em;
}

.brand-subtitle {
  font-size: 0.875rem;
  color: #94a3b8;
  margin: 0.25rem 0 0 0;
  font-weight: 500;
  opacity: 0.8;
}

/* Navigation */
.nav-main {
  flex: 1;
  padding: 1.5rem 1rem;
  position: relative;
  z-index: 1;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 16px;
  text-decoration: none;
  color: #94a3b8;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05)
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 16px;
}

.nav-link:hover::before {
  opacity: 1;
}

.nav-link:hover {
  color: white;
  transform: translateX(4px);
}

.nav-link.router-link-active,
.nav-link.router-link-exact-active {
  background: linear-gradient(45deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
}

.nav-link.router-link-active::before,
.nav-link.router-link-exact-active::before {
  opacity: 0;
}

.nav-icon {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  font-size: 1rem;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.nav-link:hover .nav-icon,
.nav-link.router-link-active .nav-icon,
.nav-link.router-link-exact-active .nav-icon {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.nav-link span {
  flex: 1;
  font-weight: 600;
}

/* Toggle Button */
.nav-toggle .toggle-icon {
  font-size: 0.875rem;
  transition: transform 0.3s ease;
  flex-shrink: 0;
  margin-left: auto;
}

.nav-toggle.is-open .toggle-icon {
  transform: rotate(180deg);
}

/* Submenu */
.nav-submenu {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease-out;
  margin-top: 0.5rem;
  margin-left: 1rem;
}

.nav-submenu.is-open {
  max-height: 300px;
}

.nav-submenu-item {
  margin-bottom: 0.375rem;
}

.nav-link--sub {
  padding: 0.875rem 1rem;
  font-size: 0.85rem;
  color: #64748b;
  border-radius: 12px;
  position: relative;
  margin-left: 1rem;
}

.nav-link--sub::before {
  content: "";
  position: absolute;
  left: -0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 1.5rem;
  background: linear-gradient(to bottom, transparent, #475569, transparent);
  border-radius: 1px;
}

.nav-link--sub .nav-icon {
  width: 1.75rem;
  height: 1.75rem;
  background: rgba(255, 255, 255, 0.05);
  font-size: 0.875rem;
}

.nav-link--sub:hover {
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.05);
}

.nav-link--sub.router-link-active,
.nav-link--sub.router-link-exact-active {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  box-shadow: none;
}

.nav-link--sub.router-link-active .nav-icon,
.nav-link--sub.router-link-exact-active .nav-icon {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.nav-link--sub.router-link-active::before,
.nav-link--sub.router-link-exact-active::before {
  background: linear-gradient(to bottom, #3b82f6, #60a5fa, #3b82f6);
  width: 3px;
}

/* User Profile Footer */
.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 16px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.user-profile:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.user-avatar {
  width: 2.75rem;
  height: 2.75rem;
  background: linear-gradient(45deg, #8b5cf6, #7c3aed);
  color: white;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.3);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  display: block;
  font-weight: 700;
  color: white;
  font-size: 0.9rem;
  line-height: 1.3;
}

.user-role {
  display: block;
  font-size: 0.75rem;
  color: #94a3b8;
  line-height: 1.3;
  margin-top: 0.125rem;
  font-weight: 500;
}

.user-menu-btn {
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.user-menu-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  transform: rotate(90deg);
}

.user-menu-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.user-menu-btn:disabled:hover {
  transform: none;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .sidebar-header {
    padding: 1.5rem 1rem;
  }

  .nav-main {
    padding: 1rem 0.75rem;
  }

  .sidebar-footer {
    padding: 1rem;
  }

  .nav-link {
    padding: 0.875rem 1rem;
  }

  .brand-container {
    gap: 0.75rem;
  }

  .brand-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.125rem;
  }

  .brand-title {
    font-size: 1.25rem;
  }
}
</style>
