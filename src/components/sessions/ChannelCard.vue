<template>
  <div
    class="channel-card"
    :class="{ 'channel-card--connecting': channel.isConnecting }"
  >
    <!-- Header Section -->
    <div class="channel-card__header">
      <div
        class="channel-card__status-indicator"
        :class="`status--${statusType}`"
      >
        <div
          class="status-dot"
          :class="{ 'status-dot--pulse': channel.isConnecting }"
        ></div>
      </div>

      <div class="channel-card__info">
        <h3 class="channel-card__title">{{ channel.name }}</h3>
        <p class="channel-card__id">{{ channel.channelId }}</p>
      </div>

      <div class="channel-card__actions">
        <button
          v-if="!channel.isConnecting"
          class="action-btn"
          @click="toggleMenu"
          :class="{ active: menuOpen }"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>

        <div v-if="channel.isConnecting" class="loading-spinner"></div>
      </div>
    </div>

    <!-- Status Badge -->
    <div class="channel-card__status">
      <span class="status-badge" :class="`status-badge--${statusType}`">
        <svg
          v-if="statusType === 'active'"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
        <svg
          v-else-if="statusType === 'error'"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.58L19 8l-9 9z"
          />
        </svg>
        <svg
          v-else-if="channel.isConnecting"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="spin"
        >
          <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
        </svg>
        {{ statusLabel }}
      </span>
    </div>

    <!-- Details Section -->
    <div v-if="!channel.connectionError" class="channel-card__details">
      <div v-if="channel.phoneNumber" class="detail-item">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="detail-icon"
        >
          <path
            d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"
          />
        </svg>
        <span>{{ channel.phoneNumber }}</span>
      </div>

      <div class="detail-item">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="detail-icon"
        >
          <path
            d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"
          />
        </svg>
        <span>{{ formatLastActivity }}</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="channel.connectionError" class="channel-card__error">
      <div class="error-message">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="error-icon"
        >
          <path
            d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z"
          />
        </svg>
        <span>{{ channel.connectionError }}</span>
      </div>
      <button class="retry-btn" @click="connect">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"
          />
        </svg>
        Retry
      </button>
    </div>

    <!-- Actions Menu -->
    <div v-if="menuOpen" class="actions-menu" @click.stop>
      <div class="menu-backdrop" @click="closeMenu"></div>
      <div class="menu-content">
        <button class="menu-item menu-item--primary" @click="connect">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"
            />
          </svg>
          Connect
        </button>

        <button
          v-if="channel.phoneNumber"
          class="menu-item menu-item--secondary"
          @click="requestPairingCode"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"
            />
          </svg>
          Pairing Code
        </button>

        <button class="menu-item menu-item--warning" @click="disconnect">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
          </svg>
          Disconnect
        </button>

        <button
          class="menu-item menu-item--danger"
          @click="showDeleteConfirmation"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z"
            />
          </svg>
          Delete
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      v-model:isVisible="showDeleteModal"
      title="Delete Channel"
      :message="`Are you sure you want to delete '${channel.name}'?`"
      sub-message="This action cannot be undone. All channel data will be permanently removed."
      confirm-text="Delete Channel"
      cancel-text="Cancel"
      variant="danger"
      @confirm="confirmDeleteChannel"
      @cancel="cancelDeleteChannel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import type { WhatsAppChannel } from "../../types/sessions";
import { useChannelStore } from "@/store/sessions";
import ConfirmationModal from "@/components/common/ConfirmationModal.vue";
import { useToast } from "@/composables/useToast";

const props = defineProps<{
  channel: WhatsAppChannel;
}>();

const store = useChannelStore();
const { success, error } = useToast();
const menuOpen = ref(false);
const showDeleteModal = ref(false);

const statusType = computed(() => {
  switch (props.channel.status) {
    case "active":
    case "open":
      return "active";
    case "qr_ready":
    case "pairing_code_ready":
      return "ready";
    case "connecting":
      return "connecting";
    case "inactive":
    case "close":
      return "inactive";
    case "error":
      return "error";
    case "logged_out":
      return "logged_out";
    default:
      return "inactive";
  }
});

const statusLabel = computed(() => {
  if (props.channel.isConnecting) return "Connecting...";

  switch (props.channel.status) {
    case "active":
    case "open":
      return "Active";
    case "qr_ready":
      return "QR Ready";
    case "pairing_code_ready":
      return "Pairing Ready";
    case "connecting":
      return "Connecting";
    case "inactive":
    case "close":
      return "Inactive";
    case "error":
      return "Error";
    case "logged_out":
      return "Logged Out";
    default:
      return "Unknown";
  }
});

const formatLastActivity = computed(() => {
  if (!props.channel.lastActivity) return "No activity";
  const date = new Date(props.channel.lastActivity);
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    Math.round((date.getTime() - Date.now()) / (1000 * 60)),
    "minute"
  );
});

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const closeMenu = () => {
  menuOpen.value = false;
};

const connect = async () => {
  try {
    // Subscribe to channel updates
    store.subscribeToChannel(props.channel.channelId);
    await store.connectChannel(
      props.channel.channelId,
      props.channel.phoneNumber
    );
    success("Channel connection initiated", "Success");
  } catch (err: any) {
    error(err.message || "Failed to connect channel", "Error");
  }
  closeMenu();
};

const disconnect = async () => {
  try {
    // Unsubscribe from channel updates
    store.unsubscribeFromChannel(props.channel.channelId);
    await store.disconnectChannel(props.channel.channelId);
    success("Channel disconnected successfully", "Success");
  } catch (err: any) {
    error(err.message || "Failed to disconnect channel", "Error");
  }
  closeMenu();
};

const showDeleteConfirmation = () => {
  showDeleteModal.value = true;
  closeMenu();
};

const confirmDeleteChannel = async () => {
  try {
    store.unsubscribeFromChannel(props.channel.channelId);
    await store.deleteChannel(props.channel.channelId);
    success(`Channel '${props.channel.name}' deleted successfully`, "Success");
  } catch (err: any) {
    error(err.message || "Failed to delete channel", "Error");
  }
};

const cancelDeleteChannel = () => {
  showDeleteModal.value = false;
};

const requestPairingCode = async () => {
  try {
    if (props.channel.phoneNumber) {
      await store.requestPairingCode(
        props.channel.channelId,
        props.channel.phoneNumber
      );
      success("Pairing code requested successfully", "Success");
    } else {
      error("Phone number is required for pairing code", "Error");
    }
  } catch (err: any) {
    error(err.message || "Failed to request pairing code", "Error");
  }
  closeMenu();
};

// Auto-subscribe to active channels
onMounted(() => {
  if (props.channel.status === "active" || props.channel.status === "open") {
    store.subscribeToChannel(props.channel.channelId);
  }
});

// Cleanup subscription on unmount
onUnmounted(() => {
  store.unsubscribeFromChannel(props.channel.channelId);
});

// Close menu when clicking outside
const handleClickOutside = (event: Event) => {
  if (menuOpen.value && !(event.target as Element).closest(".channel-card")) {
    closeMenu();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.channel-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  position: relative;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.channel-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary-light);
}

.channel-card--connecting {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md), 0 0 0 1px var(--color-primary-subtle);
}

/* Header */
.channel-card__header {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.channel-card__status-indicator {
  flex-shrink: 0;
  margin-top: 4px;
}

.status-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  transition: all var(--transition-base);
}

.status-dot--pulse {
  animation: pulse 2s infinite;
}

.status--active .status-dot {
  background: var(--color-success);
}
.status--ready .status-dot {
  background: var(--color-warning);
}
.status--connecting .status-dot {
  background: var(--color-primary);
}
.status--inactive .status-dot {
  background: var(--color-text-secondary);
}
.status--error .status-dot {
  background: var(--color-danger);
}
.status--logged_out .status-dot {
  background: var(--color-text-primary);
}

.channel-card__info {
  flex: 1;
  min-width: 0;
}

.channel-card__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  line-height: 1.3;
}

.channel-card__id {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin: 0;
  font-family: var(--font-family-mono);
  background: var(--color-background);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  display: inline-block;
  border: 1px solid var(--color-border-subtle);
}

.channel-card__actions {
  flex-shrink: 0;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f3f4f6;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.action-btn.active {
  background: #3b82f6;
  color: white;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Status Badge */
.channel-card__status {
  margin-bottom: 16px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-pill);
  font-size: 0.75rem;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.status-badge--active {
  background: var(--color-success-subtle);
  color: var(--color-success);
}

.status-badge--ready {
  background: var(--color-warning-subtle);
  color: var(--color-warning);
}

.status-badge--connecting {
  background: var(--color-primary-subtle);
  color: var(--color-primary);
}

.status-badge--inactive {
  background: var(--color-background);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.status-badge--error {
  background: var(--color-danger-subtle);
  color: var(--color-danger);
}

.status-badge--logged_out {
  background: var(--color-background);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

/* Details */
.channel-card__details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
}

.detail-icon {
  color: #9ca3af;
}

/* Error State */
.channel-card__error {
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #dc2626;
  font-size: 14px;
  flex: 1;
}

.error-icon {
  color: #ef4444;
  flex-shrink: 0;
}

.retry-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.retry-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

/* Actions Menu */
.actions-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.menu-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
}

.menu-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 16px;
  padding: 8px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  min-width: 200px;
  animation: menuSlideIn 0.2s ease-out;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #374151;
}

.menu-item:hover {
  background: #f3f4f6;
}

.menu-item--primary:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #1d4ed8;
}
.menu-item--secondary:hover {
  background: rgba(245, 158, 11, 0.1);
  color: #92400e;
}
.menu-item--warning:hover {
  background: rgba(245, 158, 11, 0.1);
  color: #92400e;
}
.menu-item--danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

/* Animations */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes menuSlideIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.spin {
  animation: spin 1s linear infinite;
}

/* Responsive */
@media (max-width: 640px) {
  .channel-card {
    padding: 20px;
    margin-bottom: 12px;
  }

  .channel-card__header {
    gap: 12px;
  }

  .channel-card__title {
    font-size: 16px;
  }

  .menu-content {
    width: 90vw;
    max-width: 280px;
  }
}
</style>
