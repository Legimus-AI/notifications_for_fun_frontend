<template>
  <Teleport to="body">
    <div
      class="toast-container position-fixed top-0 end-0 p-3"
      style="z-index: 1100"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'toast',
          `text-bg-${toast.variant}`,
          { show: toast.visible, hide: !toast.visible },
        ]"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div class="toast-header" v-if="toast.title">
          <i :class="getIconClass(toast.variant)" class="me-2"></i>
          <strong class="me-auto">{{ toast.title }}</strong>
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="hideToast(toast.id)"
          ></button>
        </div>
        <div
          :class="
            toast.title
              ? 'toast-body'
              : 'toast-body d-flex justify-content-between align-items-center'
          "
        >
          <span>{{ toast.message }}</span>
          <button
            v-if="!toast.title"
            type="button"
            class="btn-close ms-2"
            aria-label="Close"
            @click="hideToast(toast.id)"
          ></button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from "@/composables/useToast";

const { toasts, hideToast } = useToast();

const getIconClass = (variant: string) => {
  switch (variant) {
    case "success":
      return "bi bi-check-circle-fill";
    case "danger":
      return "bi bi-exclamation-triangle-fill";
    case "warning":
      return "bi bi-exclamation-triangle-fill";
    case "info":
      return "bi bi-info-circle-fill";
    default:
      return "bi bi-bell";
  }
};
</script>

<style scoped>
.toast {
  margin-bottom: 0.5rem;
}

.toast.show {
  opacity: 1;
  transform: translateX(0);
  transition: all 0.3s ease-in-out;
}

.toast.hide {
  opacity: 0;
  transform: translateX(100%);
  transition: all 0.3s ease-in-out;
}

/* Custom toast colors to match Bootstrap variants */
.toast.text-bg-success {
  --bs-toast-bg: var(--bs-success);
  --bs-toast-color: var(--bs-white);
  --bs-toast-border-color: var(--bs-success);
}

.toast.text-bg-danger {
  --bs-toast-bg: var(--bs-danger);
  --bs-toast-color: var(--bs-white);
  --bs-toast-border-color: var(--bs-danger);
}

.toast.text-bg-warning {
  --bs-toast-bg: var(--bs-warning);
  --bs-toast-color: var(--bs-dark);
  --bs-toast-border-color: var(--bs-warning);
}

.toast.text-bg-info {
  --bs-toast-bg: var(--bs-info);
  --bs-toast-color: var(--bs-white);
  --bs-toast-border-color: var(--bs-info);
}

.toast.text-bg-primary {
  --bs-toast-bg: var(--bs-primary);
  --bs-toast-color: var(--bs-white);
  --bs-toast-border-color: var(--bs-primary);
}
</style>
