<template>
  <div class="about">
    <h1>About</h1>
    <p>
      This is a demo Vue.js application showcasing Vue Router and Vuex
      integration.
    </p>

    <div class="features">
      <h2>Features:</h2>
      <ul>
        <li>Vue 3 with Composition API</li>
        <li>Vue Router 4 for navigation</li>
        <li>Vuex 4 for state management</li>
        <li>TypeScript support</li>
        <li>Vite for fast development</li>
      </ul>
    </div>

    <div class="navigation">
      <router-link to="/" class="btn">Back to Home</router-link>
      <router-link to="/notifications" class="btn btn-primary"
        >View Notifications</router-link
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

// Methods
const initialize = async () => {
  // Initialize component data
  console.log("AboutView initialized");
};

// Lifecycle
onMounted(() => {
  initialize();
});
</script>

<style scoped>
.about {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.features {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin: 2rem 0;
}

.features ul {
  margin: 1rem 0;
  padding-left: 2rem;
}

.features li {
  margin: 0.5rem 0;
}

.navigation {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  background: #6c757d;
  color: white;
}

.btn-primary {
  background: #007bff;
}

.btn:hover {
  opacity: 0.8;
}
</style>
