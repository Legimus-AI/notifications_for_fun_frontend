<template>
  <header class="page-header">
    <div class="page-header__content">
      <div class="page-title-section">
        <!-- Breadcrumb Navigation -->
        <nav
          v-if="breadcrumbs && breadcrumbs.length > 0"
          class="breadcrumb-nav"
        >
          <ol class="breadcrumb">
            <li
              v-for="(crumb, index) in breadcrumbs"
              :key="index"
              class="breadcrumb-item"
              :class="{
                'breadcrumb-item--active': index === breadcrumbs.length - 1,
              }"
            >
              <router-link
                v-if="crumb.to && index !== breadcrumbs.length - 1"
                :to="crumb.to"
                class="breadcrumb-link"
              >
                <font-awesome-icon
                  v-if="crumb.icon"
                  :icon="crumb.icon"
                  class="breadcrumb-icon"
                />
                {{ crumb.label }}
              </router-link>
              <span v-else class="breadcrumb-text">
                <font-awesome-icon
                  v-if="crumb.icon"
                  :icon="crumb.icon"
                  class="breadcrumb-icon"
                />
                {{ crumb.label }}
              </span>
              <font-awesome-icon
                v-if="index < breadcrumbs.length - 1"
                :icon="['fas', 'chevron-right']"
                class="breadcrumb-separator"
              />
            </li>
          </ol>
        </nav>

        <!-- Page Title -->
        <div class="title-container">
          <h1 class="page-title">
            <div v-if="icon" class="page-icon-wrapper">
              <font-awesome-icon :icon="icon" class="page-icon" />
            </div>
            {{ title }}
          </h1>
          <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
        </div>
      </div>

      <div v-if="$slots.actions || $slots.stats" class="header-right">
        <div v-if="$slots.stats" class="header-stats">
          <slot name="stats"></slot>
        </div>
        <div v-if="$slots.actions" class="page-actions">
          <slot name="actions"></slot>
        </div>
      </div>
    </div>

    <!-- Decorative Elements -->
    <div class="header-decoration">
      <div class="decoration-circle decoration-circle--1"></div>
      <div class="decoration-circle decoration-circle--2"></div>
      <div class="decoration-circle decoration-circle--3"></div>
    </div>
  </header>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
  label: string;
  to?: string;
  icon?: string[] | string;
}

interface Props {
  title: string;
  subtitle?: string;
  icon?: string[] | string;
  breadcrumbs?: BreadcrumbItem[];
}

defineProps<Props>();
</script>

<style scoped>
/* Modern Container */
.page-header {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(248, 250, 252, 0.98) 50%,
    rgba(241, 245, 249, 0.95) 100%
  );
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(12px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  position: relative;
}

.page-header::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(59, 130, 246, 0.3) 25%,
    rgba(139, 92, 246, 0.3) 75%,
    transparent 100%
  );
}

.page-header__content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-lg);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-lg);
  position: relative;
  z-index: 2;
}

.page-title-section {
  flex: 1;
  min-width: 0;
}

/* Breadcrumb Navigation */
.breadcrumb-nav {
  margin-bottom: var(--spacing-md);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 0.875rem;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.breadcrumb-link {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.breadcrumb-link:hover {
  color: var(--color-primary);
  background: rgba(59, 130, 246, 0.08);
  transform: translateY(-1px);
}

.breadcrumb-text {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--color-text-primary);
  font-weight: 600;
  padding: 0.25rem 0.5rem;
}

.breadcrumb-item--active .breadcrumb-text {
  background: linear-gradient(45deg, var(--color-primary), #1d4ed8);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.breadcrumb-icon {
  font-size: 0.75rem;
  opacity: 0.8;
}

.breadcrumb-separator {
  font-size: 0.625rem;
  color: var(--color-text-secondary);
  opacity: 0.6;
  margin: 0 0.25rem;
}

/* Title Container */
.title-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.page-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.1;
  letter-spacing: -0.025em;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background: linear-gradient(
    135deg,
    var(--color-text-primary) 0%,
    rgba(71, 85, 105, 0.8) 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.page-icon-wrapper {
  width: 3.5rem;
  height: 3.5rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, #1d4ed8 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.25);
  position: relative;
  overflow: hidden;
}

.page-icon-wrapper::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.2) 0%,
    transparent 50%,
    rgba(255, 255, 255, 0.1) 100%
  );
  border-radius: inherit;
}

.page-icon {
  font-size: 1.5rem;
  color: white;
  position: relative;
  z-index: 1;
}

.page-subtitle {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
  font-weight: 500;
  opacity: 0.8;
}

.header-right {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-sm);
}

.header-stats {
  display: flex;
  gap: var(--spacing-lg);
}

.page-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

/* Decorative Elements */
.header-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.1) 0%,
    rgba(139, 92, 246, 0.05) 100%
  );
  animation: float 6s ease-in-out infinite;
}

.decoration-circle--1 {
  width: 120px;
  height: 120px;
  top: -60px;
  right: -60px;
  animation-delay: 0s;
}

.decoration-circle--2 {
  width: 80px;
  height: 80px;
  top: 20px;
  right: 150px;
  animation-delay: 2s;
}

.decoration-circle--3 {
  width: 60px;
  height: 60px;
  top: -30px;
  right: 300px;
  animation-delay: 4s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-10px) rotate(180deg);
    opacity: 0.6;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-header__content {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
  }

  .page-title {
    font-size: 1.875rem;
  }

  .page-icon-wrapper {
    width: 3rem;
    height: 3rem;
  }

  .page-icon {
    font-size: 1.25rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .header-right {
    flex-direction: column;
    gap: var(--spacing-md);
    width: 100%;
    margin-top: 0;
  }

  .header-stats {
    justify-content: center;
    width: 100%;
    flex-wrap: wrap;
  }

  .page-actions {
    justify-content: flex-start;
    width: 100%;
  }

  .breadcrumb {
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .breadcrumb-link,
  .breadcrumb-text {
    font-size: 0.8rem;
    padding: 0.125rem 0.375rem;
  }
}

@media (max-width: 480px) {
  .page-header__content {
    padding: var(--spacing-md);
  }

  .page-title {
    font-size: 1.5rem;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .page-icon-wrapper {
    width: 2.5rem;
    height: 2.5rem;
  }

  .page-icon {
    font-size: 1.125rem;
  }

  .header-stats {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .decoration-circle--2,
  .decoration-circle--3 {
    display: none;
  }
}
</style>
