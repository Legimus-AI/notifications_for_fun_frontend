<template>
  <div class="webhooks-container">
    <!-- Page Header -->
    <PageHeader
      title="Webhooks"
      subtitle="Configure and monitor webhook endpoints for real-time notifications"
      :icon="['fas', 'share-nodes']"
      :breadcrumbs="[
        { label: 'Integrations', icon: ['fas', 'puzzle-piece'], to: '/' },
        { label: 'Webhooks', icon: ['fas', 'share-nodes'] },
      ]"
    >
      <template #stats>
        <StatCard
          :value="totalChannels"
          label="Active Channels"
          bootstrap-icon="bi bi-broadcast"
        />
        <StatCard
          :value="totalWebhooks"
          label="Total Webhooks"
          bootstrap-icon="bi bi-link-45deg"
        />
      </template>
    </PageHeader>

    <!-- Content Section -->
    <div class="content-wrapper">
      <!-- Loading State -->
      <div v-if="channelsLoading" class="state-container">
        <div class="state-card loading">
          <div class="state-icon">
            <div class="loading-spinner">
              <div class="spinner"></div>
            </div>
          </div>
          <h3 class="state-title">Loading Channels</h3>
          <p class="state-text">Please wait while we fetch your channels...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="state-container">
        <div class="state-card error">
          <div class="state-icon">
            <i class="bi bi-exclamation-triangle"></i>
          </div>
          <h3 class="state-title">Something went wrong</h3>
          <p class="state-text">{{ error }}</p>
          <button class="modern-btn primary" @click="initialize">
            <i class="bi bi-arrow-clockwise me-2"></i>Try Again
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="activeChannels.length === 0" class="state-container">
        <div class="state-card empty">
          <div class="state-icon">
            <i class="bi bi-chat-dots"></i>
          </div>
          <h3 class="state-title">No Active Channels</h3>
          <p class="state-text">
            Create and activate WhatsApp channels to start configuring webhooks
          </p>
          <router-link to="/" class="modern-btn success">
            <i class="bi bi-plus-circle me-2"></i>Create First Channel
          </router-link>
        </div>
      </div>

      <!-- Channels Grid -->
      <div v-else class="channels-grid">
        <div
          v-for="channel in activeChannels"
          :key="channel.channelId"
          class="modern-card channel-card"
        >
          <!-- Channel Header -->
          <div class="card-header">
            <div class="channel-avatar">
              <i class="bi bi-whatsapp"></i>
            </div>
            <div class="channel-info">
              <div class="channel-title">
                <h3 class="channel-name">{{ channel.name }}</h3>
                <span
                  class="status-badge"
                  :class="getStatusClass(channel.status)"
                >
                  <i class="status-dot"></i>
                  {{ formatStatus(channel.status) }}
                </span>
              </div>
              <div class="channel-meta">
                <span v-if="channel.phoneNumber" class="meta-item">
                  <i class="bi bi-telephone me-1"></i>{{ channel.phoneNumber }}
                </span>
                <span class="meta-item">
                  <i class="bi bi-tag me-1"></i
                  >{{ channel.channelId.slice(0, 8) }}...
                </span>
              </div>
            </div>
            <div class="channel-actions">
              <button
                class="modern-btn primary sm"
                @click="showAddWebhookForm(channel.channelId)"
                :class="{ active: activeAddForms[channel.channelId] }"
              >
                <i class="bi bi-plus-lg"></i>
                <span>Add Webhook</span>
              </button>
            </div>
          </div>

          <!-- Add Webhook Form -->
          <BCollapse
            v-model="activeAddForms[channel.channelId]"
            class="webhook-form-collapse"
          >
            <div class="webhook-form">
              <div class="form-header">
                <h4 class="form-title">
                  <i class="bi bi-plus-circle me-2"></i>
                  Configure New Webhook
                </h4>
                <p class="form-subtitle">
                  Add a webhook endpoint to receive real-time notifications
                </p>
              </div>

              <form
                @submit.prevent="handleAddWebhook(channel.channelId)"
                class="modern-form"
              >
                <div class="form-group">
                  <label class="form-label">
                    <i class="bi bi-link me-2"></i>Webhook URL
                  </label>
                  <div class="input-group">
                    <div class="input-icon">
                      <i class="bi bi-globe"></i>
                    </div>
                    <BFormInput
                      :model-value="
                        newWebhookForms[channel.channelId]?.url || ''
                      "
                      @update:model-value="(value: string) => updateWebhookFormUrl(channel.channelId, value)"
                      type="url"
                      placeholder="https://your-server.com/webhook"
                      required
                      class="modern-input"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="bi bi-lightning me-2"></i>Event Types
                  </label>
                  <div class="events-grid">
                    <div
                      v-for="event in availableEvents"
                      :key="event.value"
                      class="event-option"
                    >
                      <BFormCheckbox
                        :model-value="
                          newWebhookForms[channel.channelId]?.events || []
                        "
                        @update:model-value="(value: string[]) => updateWebhookFormEvents(channel.channelId, value)"
                        :value="event.value"
                        class="event-checkbox"
                      >
                        <div class="event-content">
                          <i
                            class="event-icon"
                            :class="getEventIcon(event.value)"
                          ></i>
                          <span class="event-label">{{ event.label }}</span>
                        </div>
                      </BFormCheckbox>
                    </div>
                  </div>
                </div>

                <div class="form-actions">
                  <button
                    type="button"
                    class="modern-btn secondary"
                    @click="cancelAddWebhook(channel.channelId)"
                  >
                    <i class="bi bi-x me-2"></i>Cancel
                  </button>
                  <button
                    type="submit"
                    class="modern-btn primary"
                    :disabled="channelsLoading"
                  >
                    <span v-if="channelsLoading" class="btn-spinner">
                      <i class="bi bi-arrow-repeat spinning me-2"></i>
                    </span>
                    <i v-else class="bi bi-plus-circle me-2"></i>
                    {{ channelsLoading ? "Adding..." : "Add Webhook" }}
                  </button>
                </div>
              </form>
            </div>
          </BCollapse>

          <!-- Webhooks List -->
          <div class="webhooks-section">
            <div class="section-header">
              <h4 class="section-title">
                <i class="bi bi-list-check me-2"></i>
                Configured Webhooks
              </h4>
              <div class="webhook-count">
                {{ (channel.webhooks || []).length }}
              </div>
            </div>

            <!-- No Webhooks -->
            <div
              v-if="!channel.webhooks || channel.webhooks.length === 0"
              class="empty-webhooks"
            >
              <div class="empty-icon">
                <i class="bi bi-link-45deg"></i>
              </div>
              <p class="empty-text">No webhooks configured yet</p>
            </div>

            <!-- Webhooks List -->
            <div v-else class="webhooks-list">
              <div
                v-for="webhook in channel.webhooks"
                :key="webhook._id"
                class="webhook-item"
                :class="{ inactive: !webhook.isActive }"
              >
                <div class="webhook-status">
                  <div
                    class="status-indicator"
                    :class="{ active: webhook.isActive }"
                  ></div>
                </div>

                <div class="webhook-content">
                  <div class="webhook-url">
                    <i class="bi bi-link-45deg me-2"></i>
                    <span class="url-text">{{ webhook.url }}</span>
                    <div
                      class="webhook-badge"
                      :class="{ active: webhook.isActive }"
                    >
                      {{ webhook.isActive ? "Active" : "Inactive" }}
                    </div>
                  </div>

                  <div class="webhook-events">
                    <span
                      v-for="event in webhook.events"
                      :key="event"
                      class="event-badge"
                    >
                      <i
                        class="event-badge-icon"
                        :class="getEventIcon(event)"
                      ></i>
                      {{ formatEventName(event) }}
                    </span>
                  </div>
                </div>

                <div class="webhook-controls">
                  <div class="toggle-wrapper">
                    <BFormCheckbox
                      switch
                      :checked="webhook.isActive"
                      @change="
                        webhook._id &&
                          toggleWebhook(
                            channel.channelId,
                            webhook._id,
                            !webhook.isActive
                          )
                      "
                      class="modern-toggle"
                    />
                  </div>
                  <button
                    class="action-btn danger"
                    @click="
                      webhook._id &&
                        confirmDeleteWebhook(channel.channelId, webhook._id)
                    "
                    title="Delete Webhook"
                  >
                    <i class="bi bi-trash3"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Container -->
    <ToastContainer />

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :show="showConfirmModal"
      :title="confirmModalData.title"
      :message="confirmModalData.message"
      :variant="confirmModalData.variant"
      :confirm-text="confirmModalData.confirmText"
      @confirm="handleConfirmAction"
      @cancel="cancelConfirmAction"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from "vue";
import { useChannelStore } from "@/store/sessions";
import { storeToRefs } from "pinia";
import type { ChannelWebhook } from "@/types/sessions";
import { BCollapse, BFormInput, BFormCheckbox } from "bootstrap-vue-3";
import { useToast } from "@/composables/useToast";
import ToastContainer from "@/components/common/ToastContainer.vue";
import ConfirmationModal from "@/components/common/ConfirmationModal.vue";
import PageHeader from "@/components/layout/PageHeader.vue";
import StatCard from "@/components/common/StatCard.vue";

// Stores
const channelStore = useChannelStore();
const { success, error: showErrorToast, warning } = useToast();

// Refs from stores
const {
  channels,
  isLoading: channelsLoading,
  error,
} = storeToRefs(channelStore);

// Component state
const activeAddForms = ref<Record<string, boolean>>({});
const newWebhookForms = ref<Record<string, { url: string; events: string[] }>>(
  {}
);

// Confirmation modal state
const showConfirmModal = ref(false);
const confirmModalData = ref({
  title: "",
  message: "",
  variant: "danger" as "danger" | "warning" | "success" | "primary",
  confirmText: "Delete",
});
const pendingAction = ref<(() => Promise<void>) | null>(null);

// Available events based on the MongoDB schema
const availableEvents = [
  { value: "message.received", label: "Message Received" },
  { value: "message.sent", label: "Message Sent" },
  { value: "message.delivered", label: "Message Delivered" },
  { value: "message.read", label: "Message Read" },
];

// Computed properties
const activeChannels = computed(() => {
  return channels.value.filter(
    (channel) => channel.status === "active" || channel.status === "open"
  );
});

const totalChannels = computed(() => activeChannels.value.length);

const totalWebhooks = computed(() => {
  return activeChannels.value.reduce((total, channel) => {
    return total + (channel.webhooks?.length || 0);
  }, 0);
});

// Methods
const initialize = async () => {
  try {
    await channelStore.fetchChannels();
  } catch (e) {
    showErrorToast("Failed to load channels. Please try again.");
  }
};

const showAddWebhookForm = (channelId: string) => {
  activeAddForms.value[channelId] = true;
  if (!newWebhookForms.value[channelId]) {
    newWebhookForms.value[channelId] = {
      url: "",
      events: ["message.received"],
    };
  }
};

const updateWebhookFormUrl = (channelId: string, value: string) => {
  if (!newWebhookForms.value[channelId]) {
    newWebhookForms.value[channelId] = {
      url: "",
      events: ["message.received"],
    };
  }
  newWebhookForms.value[channelId].url = value;
};

const updateWebhookFormEvents = (channelId: string, value: string[]) => {
  if (!newWebhookForms.value[channelId]) {
    newWebhookForms.value[channelId] = {
      url: "",
      events: ["message.received"],
    };
  }
  newWebhookForms.value[channelId].events = value;
};

const cancelAddWebhook = (channelId: string) => {
  activeAddForms.value[channelId] = false;
  newWebhookForms.value[channelId] = {
    url: "",
    events: ["message.received"],
  };
};

const handleAddWebhook = async (channelId: string) => {
  const formData = newWebhookForms.value[channelId];

  if (!formData || !formData.url || formData.events.length === 0) {
    showErrorToast(
      "Please fill in all required fields and select at least one event."
    );
    return;
  }

  try {
    await channelStore.addWebhookToChannel(channelId, {
      url: formData.url,
      events: formData.events,
    });

    success("Webhook added successfully!");
    // Reset form and close
    cancelAddWebhook(channelId);
  } catch (e) {
    console.error("Failed to add webhook:", e);
    showErrorToast("Failed to add webhook. Please try again.");
  }
};

const toggleWebhook = async (
  channelId: string,
  webhookId: string | undefined,
  isActive: boolean
) => {
  if (!webhookId) return;

  try {
    await channelStore.toggleChannelWebhook(channelId, webhookId, isActive);
    success(`Webhook ${isActive ? "activated" : "deactivated"} successfully!`);
  } catch (e) {
    console.error("Failed to toggle webhook:", e);
    showErrorToast("Failed to update webhook status. Please try again.");
  }
};

const confirmDeleteWebhook = (
  channelId: string,
  webhookId: string | undefined
) => {
  if (!webhookId) return;

  confirmModalData.value = {
    title: "Delete Webhook",
    message:
      "Are you sure you want to delete this webhook? This action cannot be undone.",
    variant: "danger",
    confirmText: "Delete Webhook",
  };

  pendingAction.value = async () => {
    await deleteWebhook(channelId, webhookId);
  };

  showConfirmModal.value = true;
};

const deleteWebhook = async (channelId: string, webhookId: string) => {
  try {
    await channelStore.deleteChannelWebhook(channelId, webhookId);
    success("Webhook deleted successfully!");
  } catch (e) {
    console.error("Failed to delete webhook:", e);
    showErrorToast("Failed to delete webhook. Please try again.");
  }
};

const handleConfirmAction = async () => {
  if (pendingAction.value) {
    try {
      await pendingAction.value();
    } catch (e) {
      console.error("Action failed:", e);
    }
  }
  showConfirmModal.value = false;
  pendingAction.value = null;
};

const cancelConfirmAction = () => {
  showConfirmModal.value = false;
  pendingAction.value = null;
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "active":
    case "open":
      return "success";
    case "connecting":
      return "warning";
    case "error":
      return "danger";
    default:
      return "secondary";
  }
};

const formatStatus = (status: string) => {
  switch (status) {
    case "active":
    case "open":
      return "Active";
    case "connecting":
      return "Connecting";
    case "error":
      return "Error";
    default:
      return "Inactive";
  }
};

const getEventIcon = (event: string) => {
  switch (event) {
    case "message.received":
      return "bi bi-arrow-down-circle";
    case "message.sent":
      return "bi bi-arrow-up-circle";
    case "message.delivered":
      return "bi bi-check-circle";
    case "message.read":
      return "bi bi-check2-all";
    default:
      return "bi bi-circle";
  }
};

const formatEventName = (event: string) => {
  return event
    .split(".")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

onMounted(initialize);
</script>

<style scoped>
/* Modern Container */
.webhooks-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  color: #1f2937;
}

/* Page Header styles moved to PageHeader.vue component */

/* Content Wrapper */
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 3rem;
}

/* State Container */
.state-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
}

.state-card {
  background: white;
  border-radius: 24px;
  padding: 4rem 3rem;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #f3f4f6;
  max-width: 600px;
  width: 100%;
}

.state-icon {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2.5rem;
  font-size: 2.5rem;
}

.state-card.loading .state-icon {
  background: linear-gradient(45deg, #eff6ff, #dbeafe);
  color: #3b82f6;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
}

.state-card.error .state-icon {
  background: linear-gradient(45deg, #fef2f2, #fee2e2);
  color: #ef4444;
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.15);
}

.state-card.empty .state-icon {
  background: linear-gradient(45deg, #f9fafb, #f3f4f6);
  color: #9ca3af;
  box-shadow: 0 8px 24px rgba(156, 163, 175, 0.15);
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.state-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.75rem;
}

.state-text {
  color: #6b7280;
  margin-bottom: 2.5rem;
  line-height: 1.6;
  font-size: 1.1rem;
}

/* Modern Button Styles */
.modern-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 16px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  line-height: 1;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.modern-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.15);
}

.modern-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.modern-btn.primary {
  background: linear-gradient(45deg, #3b82f6, #1d4ed8);
  color: white;
}

.modern-btn.primary:hover {
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}

.modern-btn.secondary {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.modern-btn.secondary:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.modern-btn.success {
  background: linear-gradient(45deg, #10b981, #059669);
  color: white;
}

.modern-btn.success:hover {
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.modern-btn.danger {
  background: linear-gradient(45deg, #ef4444, #dc2626);
  color: white;
}

.modern-btn.danger:hover {
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
}

.modern-btn.sm {
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  border-radius: 12px;
}

/* Modern Card Styles */
.modern-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #f3f4f6;
  transition: all 0.3s ease;
  overflow: hidden;
}

.modern-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: #e5e7eb;
}

/* Status Badge Styles */
.status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 16px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-badge.success {
  background: linear-gradient(45deg, #d1fae5, #a7f3d0);
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.status-badge.success .status-dot {
  background: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
}

.status-badge.warning {
  background: linear-gradient(45deg, #fef3c7, #fde68a);
  color: #92400e;
  border: 1px solid #fde68a;
}

.status-badge.warning .status-dot {
  background: #f59e0b;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.3);
}

.status-badge.danger {
  background: linear-gradient(45deg, #fee2e2, #fecaca);
  color: #991b1b;
  border: 1px solid #fecaca;
}

.status-badge.danger .status-dot {
  background: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3);
}

.status-badge.secondary {
  background: linear-gradient(45deg, #f3f4f6, #e5e7eb);
  color: #374151;
  border: 1px solid #e5e7eb;
}

.status-badge.secondary .status-dot {
  background: #9ca3af;
}

/* Channels Grid */
.channels-grid {
  display: grid;
  gap: 2rem;
}

.channel-card {
  overflow: hidden;
}

.card-header {
  padding: 2.5rem;
  background: linear-gradient(135deg, white 0%, #fafbfc 100%);
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: flex-start;
  gap: 2rem;
}

.channel-avatar {
  width: 64px;
  height: 64px;
  background: linear-gradient(45deg, #25d366, #128c7e);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.75rem;
  flex-shrink: 0;
  box-shadow: 0 8px 20px rgba(37, 211, 102, 0.3);
}

.channel-info {
  flex: 1;
}

.channel-title {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1rem;
}

.channel-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.channel-meta {
  display: flex;
  gap: 2rem;
  color: #6b7280;
  font-size: 0.95rem;
  font-weight: 500;
}

.meta-item {
  display: flex;
  align-items: center;
}

.channel-actions {
  margin-left: auto;
}

/* Webhook Form */
.webhook-form-collapse {
  border-bottom: 1px solid #f3f4f6;
}

.webhook-form {
  padding: 2.5rem;
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
}

.form-header {
  margin-bottom: 2.5rem;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.75rem 0;
  display: flex;
  align-items: center;
}

.form-subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
}

.modern-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
}

.input-group {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 1.1rem;
  z-index: 2;
}

.modern-input {
  width: 100%;
  padding: 1rem 1.25rem 1rem 3.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: white;
  font-weight: 500;
}

.modern-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}

.event-option {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 1.25rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.event-option:hover {
  border-color: #3b82f6;
  background: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.event-checkbox {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 0;
}

.event-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: 0.75rem;
}

.event-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: #6b7280;
}

.event-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.form-actions {
  display: flex;
  gap: 1.25rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn-spinner .spinning {
  animation: spin 1s linear infinite;
}

/* Webhooks Section */
.webhooks-section {
  padding: 2.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
}

.webhook-count {
  background: linear-gradient(45deg, #3b82f6, #1d4ed8);
  color: white;
  font-weight: 700;
  font-size: 0.8rem;
  padding: 0.5rem 1rem;
  border-radius: 16px;
  min-width: 32px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

/* Empty Webhooks */
.empty-webhooks {
  text-align: center;
  padding: 3rem;
  color: #9ca3af;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #f9fafb, #f3f4f6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2rem;
  box-shadow: 0 8px 20px rgba(156, 163, 175, 0.15);
}

.empty-text {
  margin: 0;
  font-style: italic;
  font-size: 1rem;
  font-weight: 500;
}

/* Webhooks List */
.webhooks-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.webhook-item {
  background: linear-gradient(135deg, white 0%, #fafbfc 100%);
  border: 1px solid #f3f4f6;
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  transition: all 0.3s ease;
}

.webhook-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  border-color: #e5e7eb;
}

.webhook-item.inactive {
  opacity: 0.6;
}

.webhook-status {
  margin-top: 0.5rem;
}

.status-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #e5e7eb;
  transition: all 0.3s ease;
}

.status-indicator.active {
  background: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
}

.webhook-content {
  flex: 1;
}

.webhook-url {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.url-text {
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 0.9rem;
  color: #374151;
  flex: 1;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-weight: 500;
}

.webhook-badge {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 16px;
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.webhook-badge.active {
  background: linear-gradient(45deg, #d1fae5, #a7f3d0);
  color: #065f46;
  border-color: #a7f3d0;
}

.webhook-events {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.event-badge {
  background: linear-gradient(45deg, #eff6ff, #dbeafe);
  color: #1e40af;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 16px;
  border: 1px solid #bfdbfe;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.event-badge-icon {
  font-size: 0.85rem;
}

.webhook-controls {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-top: 0.5rem;
}

.toggle-wrapper {
  display: flex;
  align-items: center;
}

.modern-toggle {
  margin: 0;
}

.action-btn {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.action-btn.danger {
  background: linear-gradient(45deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

.action-btn.danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .webhooks-container {
    padding: 0;
  }

  .content-wrapper {
    padding: 0 1.5rem 2rem;
  }

  .card-header {
    flex-direction: column;
    gap: 1.5rem;
    padding: 2rem;
  }

  .channel-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .webhook-form {
    padding: 2rem;
  }

  .events-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .webhook-item {
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
  }

  .webhook-controls {
    justify-content: space-between;
    margin-top: 0;
  }
}

@media (max-width: 480px) {
  .webhook-url {
    flex-direction: column;
    align-items: flex-start;
  }

  .url-text {
    width: 100%;
  }
}
</style>
