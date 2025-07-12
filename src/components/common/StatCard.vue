<template>
  <div class="stat-card">
    <div class="stat-icon">
      <font-awesome-icon v-if="icon" :icon="icon" />
      <i v-else-if="bootstrapIcon" :class="bootstrapIcon"></i>
    </div>
    <div class="stat-content">
      <div class="stat-value">{{ value }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  value: string | number;
  label: string;
  icon?: string[] | string;
  bootstrapIcon?: string;
}

defineProps<Props>();
</script>

<style scoped>
.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  min-width: 140px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: var(--color-primary);
}

.stat-icon {
  width: 40px;
  height: 40px;
  background: var(--color-primary);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .stat-card {
    min-width: 140px;
    flex: 1;
  }
}

@media (max-width: 480px) {
  .stat-card {
    width: 100%;
  }
}
</style>
