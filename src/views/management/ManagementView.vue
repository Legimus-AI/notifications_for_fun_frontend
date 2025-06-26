<template>
  <div class="management-view">
    <div class="container-fluid">
      <nav class="nav nav-tabs mb-4">
        <router-link
          to="/management/webhooks"
          class="nav-link"
          active-class="active"
        >
          Webhooks
        </router-link>
        <router-link
          to="/management/api-keys"
          class="nav-link"
          active-class="active"
        >
          API Keys
        </router-link>
        <router-link
          to="/management/phone-numbers"
          class="nav-link"
          active-class="active"
        >
          Phone Numbers
        </router-link>
      </nav>

      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
// No additional logic needed for this layout component
</script>

<style scoped>
.management-view {
  padding: 2rem 0;
}

.nav-tabs {
  border-bottom: 2px solid #e5e7eb;
}

.nav-link {
  color: #6b7280;
  font-weight: 500;
  border: none;
  padding: 1rem 1.5rem;
  margin-right: 0.5rem;
  border-radius: 8px 8px 0 0;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: #374151;
  background-color: #f9fafb;
}

.nav-link.active {
  color: #1f2937;
  background-color: white;
  border-bottom: 2px solid #3b82f6;
}
</style>
