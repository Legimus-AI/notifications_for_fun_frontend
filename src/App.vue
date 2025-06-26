<template>
  <div id="app" class="app-layout">
    <SidebarNav />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import SidebarNav from "./components/layout/SidebarNav.vue";
</script>

<style>
.app-layout {
  display: flex;
}

.main-content {
  flex-grow: 1;
  margin-left: 260px; /* Same as sidebar width */
  padding: 2rem;
  background-color: #f3f4f6;
  min-height: 100vh;
}

/* Remove old #app styles */
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Overriding old container styles */
.container {
  width: 100%;
  padding: 0;
  margin: 0;
  max-width: 100% !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 1rem;
  }

  /* You might want to hide the sidebar and use a toggle button on mobile */
  .sidebar {
    display: none;
  }
}
</style>
