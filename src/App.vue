<template>
  <div id="app" class="app" :class="{ 'app--no-sidebar': !showSidebar }">
    <!-- Navigation Sidebar -->
    <aside v-if="showSidebar" class="app-sidebar">
      <SidebarNav />
    </aside>

    <!-- Main Content Area -->
    <main class="app-main">
      <div class="app-content">
        <RouterView />
      </div>
    </main>

    <!-- Toast Container -->
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { RouterView, useRoute } from "vue-router";
import { computed } from "vue";
import SidebarNav from "./components/layout/SidebarNav.vue";
import ToastContainer from "./components/common/ToastContainer.vue";
import { useAuthStore } from "./store/auth";
import { storeToRefs } from "pinia";

const route = useRoute();
const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);

// Show sidebar only when authenticated and not on login page
const showSidebar = computed(() => {
  return isAuthenticated.value && route.name !== "Login";
});
</script>

<style>
.app {
  display: flex;
  min-height: 100vh;
  background: var(--color-background);
}

.app-sidebar {
  width: 280px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 100;
  overflow-y: auto;
}

.app-main {
  flex: 1;
  margin-left: 280px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-content {
  flex: 1;
  background: var(--color-background);
}

.app--no-sidebar .app-main {
  margin-left: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .app-sidebar {
    width: 240px;
  }

  .app-main {
    margin-left: 240px;
  }
}

@media (max-width: 768px) {
  .app {
    flex-direction: column;
  }

  .app-sidebar {
    position: relative;
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }

  .app-main {
    margin-left: 0;
  }
}
</style>
