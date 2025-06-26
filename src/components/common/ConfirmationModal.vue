<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="modal fade show"
      tabindex="-1"
      role="dialog"
      :aria-labelledby="modalId + 'Title'"
      aria-hidden="false"
      style="display: block"
    >
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" :id="modalId + 'Title'">
              {{ title }}
            </h5>
            <button
              type="button"
              class="btn-close"
              aria-label="Close"
              @click="cancel"
            ></button>
          </div>
          <div class="modal-body">
            <div class="d-flex align-items-start">
              <div class="me-3">
                <i
                  :class="iconClass"
                  class="fs-1"
                  :style="{ color: iconColor }"
                ></i>
              </div>
              <div>
                <p class="mb-0">{{ message }}</p>
                <small v-if="subMessage" class="text-muted">{{
                  subMessage
                }}</small>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="cancel">
              {{ cancelText }}
            </button>
            <button type="button" :class="confirmButtonClass" @click="confirm">
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal backdrop -->
    <div
      v-if="isVisible"
      class="modal-backdrop fade show"
      @click="cancel"
    ></div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

interface Props {
  title?: string;
  message: string;
  subMessage?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary" | "success";
  isVisible?: boolean;
}

interface Emits {
  (e: "confirm"): void;
  (e: "cancel"): void;
  (e: "update:isVisible", value: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Confirm Action",
  confirmText: "Confirm",
  cancelText: "Cancel",
  variant: "danger",
  isVisible: false,
});

const emit = defineEmits<Emits>();

const modalId = ref(`confirmModal_${Date.now()}`);

const iconClass = computed(() => {
  switch (props.variant) {
    case "danger":
      return "bi bi-exclamation-triangle-fill";
    case "warning":
      return "bi bi-exclamation-triangle-fill";
    case "success":
      return "bi bi-check-circle-fill";
    case "primary":
    default:
      return "bi bi-question-circle-fill";
  }
});

const iconColor = computed(() => {
  switch (props.variant) {
    case "danger":
      return "#dc3545";
    case "warning":
      return "#ffc107";
    case "success":
      return "#198754";
    case "primary":
    default:
      return "#0d6efd";
  }
});

const confirmButtonClass = computed(() => {
  switch (props.variant) {
    case "danger":
      return "btn btn-danger";
    case "warning":
      return "btn btn-warning";
    case "success":
      return "btn btn-success";
    case "primary":
    default:
      return "btn btn-primary";
  }
});

const confirm = () => {
  emit("confirm");
  emit("update:isVisible", false);
};

const cancel = () => {
  emit("cancel");
  emit("update:isVisible", false);
};
</script>

<style scoped>
.modal {
  z-index: 1055;
}

.modal-backdrop {
  z-index: 1050;
}

.modal-content {
  border: none;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  border-bottom: 1px solid #e9ecef;
  padding: 1.5rem;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  border-top: 1px solid #e9ecef;
  padding: 1.5rem;
  gap: 0.5rem;
}

.btn-close {
  margin: 0;
}
</style>
