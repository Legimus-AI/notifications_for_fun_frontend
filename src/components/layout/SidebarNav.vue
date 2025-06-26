<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h1 class="brand">Notifications for fun</h1>
    </div>
    <nav class="nav-main">
      <ul class="nav-list">
        <li class="nav-item">
          <router-link to="/" class="nav-link">
            <i class="bi bi-grid-1x2-fill"></i>
            <span>Dashboard</span>
          </router-link>
        </li>
        <li class="nav-item">
          <a
            @click="toggleIntegrations"
            class="nav-link collapsible"
            :class="{ 'is-open': integrationsOpen }"
          >
            <i class="bi bi-plugin"></i>
            <span>Integrations</span>
            <i class="bi bi-chevron-down toggle-icon"></i>
          </a>
          <ul class="nav-submenu" :class="{ 'is-open': integrationsOpen }">
            <li class="nav-submenu-item">
              <router-link to="/webhooks" class="nav-link">
                <i class="bi bi-webhook"></i>
                <span>Webhooks</span>
              </router-link>
            </li>
            <li class="nav-submenu-item">
              <router-link to="/management/api-keys" class="nav-link">
                <i class="bi bi-key-fill"></i>
                <span>API Keys</span>
              </router-link>
            </li>
            <li class="nav-submenu-item">
              <router-link to="/management/phone-numbers" class="nav-link">
                <i class="bi bi-phone-fill"></i>
                <span>Phone Numbers</span>
              </router-link>
            </li>
          </ul>
        </li>
        <li class="nav-item disabled">
          <a class="nav-link">
            <i class="bi bi-chat-dots-fill"></i>
            <span>Live Chat</span>
            <span class="badge">3</span>
          </a>
        </li>
      </ul>
    </nav>
    <div class="sidebar-footer">
      <div class="user-profile">
        <div class="user-avatar">JD</div>
        <div class="user-info">
          <span class="user-name">John Doe</span>
          <span class="user-email">john@company.com</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const integrationsOpen = ref(true);

const toggleIntegrations = () => {
  integrationsOpen.value = !integrationsOpen.value;
};
</script>

<style scoped>
.sidebar {
  width: 260px;
  background-color: #111827;
  color: #d1d5db;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  border-right: 1px solid #1f2937;
}

.sidebar-header {
  padding: 1.5rem;
  text-align: center;
}

.brand {
  color: white;
  font-weight: 700;
  font-size: 2rem;
  margin: 0;
}

.nav-main {
  flex-grow: 1;
  padding: 0 1rem;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  margin-bottom: 0.25rem;
  border-radius: 6px;
  text-decoration: none;
  color: #d1d5db;
  transition: background-color 0.2s, color 0.2s;
  cursor: pointer;
}

.nav-link:hover {
  background-color: #1f2937;
  color: white;
}

.nav-link.router-link-active,
.nav-link.router-link-exact-active {
  background-color: #3b82f6;
  color: white;
}

.nav-link i {
  margin-right: 0.75rem;
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

.nav-link span {
  flex-grow: 1;
}

.collapsible .toggle-icon {
  margin-left: auto;
  transition: transform 0.2s;
}

.collapsible.is-open .toggle-icon {
  transform: rotate(180deg);
}

.nav-submenu {
  list-style: none;
  padding-left: 1rem;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}

.nav-submenu.is-open {
  max-height: 500px; /* Adjust as needed */
}

.nav-submenu .nav-link {
  padding-left: 2.75rem; /* Indent submenu items */
  font-size: 0.9rem;
}

.nav-item.disabled .nav-link {
  color: #6b7280;
  cursor: not-allowed;
}

.nav-item.disabled .nav-link:hover {
  background-color: transparent;
}

.badge {
  background-color: #ef4444;
  color: white;
  border-radius: 9999px;
  padding: 0.1rem 0.5rem;
  font-size: 0.7rem;
  font-weight: 600;
  margin-left: auto;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #1f2937;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 6px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #4b5563;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  color: white;
  font-weight: 500;
}

.user-email {
  font-size: 0.8rem;
  color: #9ca3af;
}
</style>
