<template>
  <div class="sessions-container">
    <!-- Loading State -->
    <div v-if="store.isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading channels...</p>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Channels Grid -->
      <div v-if="store.channels.length" class="channels-grid">
        <ChannelCard
          v-for="channel in store.channels"
          :key="channel.id"
          :channel="channel"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-state__icon">
          <i class="bi bi-chat-dots"></i>
        </div>
        <h3 class="empty-state__title">No channels yet</h3>
        <p class="empty-state__description">
          Create your first WhatsApp channel to start managing your business
          communications.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useChannelStore } from "@/store/sessions";
import { useToast } from "@/composables/useToast";
import ChannelCard from "./ChannelCard.vue";

const store = useChannelStore();
const { error } = useToast();

const initialize = async () => {
  try {
    await store.initialize();
  } catch (err: any) {
    error(err.message || "Failed to initialize channels", "Error");
  }
};

// Watch for errors and show them as toasts
watch(
  () => store.error,
  (newError) => {
    if (newError) {
      error(newError, "Error");
      // Clear the error after showing it
      store.error = null;
    }
  },
  { immediate: true }
);

onMounted(() => {
  initialize();
});
</script>

<style scoped>
.sessions-container {
  width: 100%;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl) var(--spacing-lg);
  text-align: center;
}

.loading-text {
  margin-top: var(--spacing-md);
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* Channels Grid */
.channels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-3xl) var(--spacing-lg);
  min-height: 400px;
}

.empty-state__icon {
  width: 80px;
  height: 80px;
  background: var(--color-primary-subtle);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-lg);
}

.empty-state__icon i {
  font-size: 2rem;
  color: var(--color-primary);
}

.empty-state__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.empty-state__description {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin: 0;
  max-width: 400px;
  line-height: 1.6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .channels-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .empty-state {
    padding: var(--spacing-2xl) var(--spacing-md);
    min-height: 300px;
  }

  .empty-state__icon {
    width: 64px;
    height: 64px;
  }

  .empty-state__icon i {
    font-size: 1.5rem;
  }

  .empty-state__title {
    font-size: 1.25rem;
  }

  .empty-state__description {
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .channels-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
}
</style>
