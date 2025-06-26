<template>
  <div class="webhooks-container">
    <!-- Modern Header Section -->
    <header class="modern-header">
      <div class="header-backdrop"></div>
      <div class="header-content">
        <div class="header-main">
          <div class="header-icon">
            <i class="bi bi-webhook"></i>
          </div>
          <div class="header-text">
            <h1 class="header-title">Webhook Management</h1>
            <p class="header-subtitle">
              Configure and monitor webhook endpoints for real-time
              notifications
            </p>
          </div>
        </div>
        <div class="header-stats">
          <div class="stat-card primary">
            <div class="stat-icon">
              <i class="bi bi-broadcast"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ totalChannels }}</div>
              <div class="stat-label">Active Channels</div>
            </div>
          </div>
          <div class="stat-card secondary">
            <div class="stat-icon">
              <i class="bi bi-link-45deg"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ totalWebhooks }}</div>
              <div class="stat-label">Total Webhooks</div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Content Section -->
    <div class="content-wrapper">
      <!-- Loading State -->
      <div v-if="channelsLoading" class="loading-state">
        <div class="loading-spinner">
          <div class="spinner"></div>
        </div>
        <h3 class="loading-title">Loading Channels</h3>
        <p class="loading-text">Please wait while we fetch your channels...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">
          <i class="bi bi-exclamation-triangle"></i>
        </div>
        <h3 class="error-title">Something went wrong</h3>
        <p class="error-text">{{ error }}</p>
        <button class="retry-btn" @click="initialize">
          <i class="bi bi-arrow-clockwise me-2"></i>Try Again
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="activeChannels.length === 0" class="empty-state">
        <div class="empty-illustration">
          <div class="empty-icon">
            <i class="bi bi-chat-dots"></i>
          </div>
          <div class="empty-circles">
            <div class="circle circle-1"></div>
            <div class="circle circle-2"></div>
            <div class="circle circle-3"></div>
          </div>
        </div>
        <h3 class="empty-title">No Active Channels</h3>
        <p class="empty-description">
          Create and activate WhatsApp channels to start configuring webhooks
        </p>
        <router-link to="/" class="create-channel-btn">
          <i class="bi bi-plus-circle me-2"></i>Create First Channel
        </router-link>
      </div>

      <!-- Channels Grid -->
      <div v-else class="channels-grid">
        <div
          v-for="channel in activeChannels"
          :key="channel.channelId"
          class="channel-card"
        >
          <!-- Channel Header -->
          <div class="channel-header">
            <div class="channel-avatar">
              <i class="bi bi-whatsapp"></i>
            </div>
            <div class="channel-info">
              <div class="channel-title">
                <h3 class="channel-name">{{ channel.name }}</h3>
                <span
                  class="channel-status"
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
                class="action-btn add-webhook"
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
            class="webhook-form-section"
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
                  <div class="input-wrapper">
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
                    <div class="input-icon">
                      <i class="bi bi-globe"></i>
                    </div>
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
                    class="btn-secondary"
                    @click="cancelAddWebhook(channel.channelId)"
                  >
                    <i class="bi bi-x me-2"></i>Cancel
                  </button>
                  <button
                    type="submit"
                    class="btn-primary"
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
              class="no-webhooks"
            >
              <div class="no-webhooks-illustration">
                <i class="bi bi-link-45deg"></i>
              </div>
              <p class="no-webhooks-text">No webhooks configured yet</p>
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
                    class="delete-btn"
                    @click="
                      webhook._id &&
                        deleteWebhook(channel.channelId, webhook._id)
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from "vue";
import { useChannelStore } from "@/store/sessions";
import { storeToRefs } from "pinia";
import type { ChannelWebhook } from "@/types/sessions";
import { BCollapse, BFormInput, BFormCheckbox } from "bootstrap-vue-3";

// Stores
const channelStore = useChannelStore();

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
const initialize = () => {
  channelStore.fetchChannels();
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
    alert("Please fill in all required fields and select at least one event.");
    return;
  }

  try {
    await channelStore.addWebhookToChannel(channelId, {
      url: formData.url,
      events: formData.events,
    });

    // Reset form and close
    cancelAddWebhook(channelId);
  } catch (e) {
    console.error("Failed to add webhook:", e);
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
  } catch (e) {
    console.error("Failed to toggle webhook:", e);
  }
};

const deleteWebhook = async (
  channelId: string,
  webhookId: string | undefined
) => {
  if (!webhookId) return;

  if (
    confirm(
      "Are you sure you want to delete this webhook? This action cannot be undone."
    )
  ) {
    try {
      await channelStore.deleteChannelWebhook(channelId, webhookId);
    } catch (e) {
      console.error("Failed to delete webhook:", e);
    }
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "active":
    case "open":
      return "status-active";
    case "connecting":
      return "status-connecting";
    case "error":
      return "status-error";
    default:
      return "status-inactive";
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
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Modern Header */
.modern-header {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  padding: 3rem 2rem;
  margin-bottom: 2rem;
  overflow: hidden;
}

.header-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255,255,255,0.1)'%3e%3cpath d='m0 2 2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2L20 0v2l-2 2-2-2-2 2-2-2-2 2-2-2-2 2-2-2-2 2-2-2-2 2-2-2L0 4z'/%3e%3c/svg%3e");
  opacity: 0.6;
}

.header-content {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  color: white;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.header-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  background: linear-gradient(45deg, #ffffff, #f1f5f9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-subtitle {
  font-size: 1.1rem;
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
  line-height: 1.5;
}

.header-stats {
  display: flex;
  gap: 1rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 160px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.2);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.stat-card.primary .stat-icon {
  background: linear-gradient(45deg, #3b82f6, #1d4ed8);
}

.stat-card.secondary .stat-icon {
  background: linear-gradient(45deg, #8b5cf6, #7c3aed);
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.8;
  margin-top: 0.25rem;
}

/* Content Wrapper */
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 2rem;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  margin-bottom: 2rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.loading-text {
  color: #6b7280;
  font-size: 1rem;
}

/* Error State */
.error-state {
  text-align: center;
  padding: 4rem 2rem;
}

.error-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(45deg, #ef4444, #dc2626);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: white;
  font-size: 1.5rem;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.error-text {
  color: #6b7280;
  margin-bottom: 2rem;
}

.retry-btn {
  background: linear-gradient(45deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-illustration {
  position: relative;
  margin-bottom: 2rem;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #f3f4f6, #e5e7eb);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 2rem;
  color: #9ca3af;
  position: relative;
  z-index: 2;
}

.empty-circles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.circle {
  position: absolute;
  border: 2px solid #e5e7eb;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.circle-1 {
  width: 100px;
  height: 100px;
  top: -50px;
  left: -50px;
}

.circle-2 {
  width: 140px;
  height: 140px;
  top: -70px;
  left: -70px;
  animation-delay: 0.5s;
}

.circle-3 {
  width: 180px;
  height: 180px;
  top: -90px;
  left: -90px;
  animation-delay: 1s;
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(0.8);
  }
  50% {
    opacity: 0.5;
    transform: scale(1);
  }
  100% {
    opacity: 1;
    transform: scale(0.8);
  }
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
}

.empty-description {
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.6;
  max-width: 400px;
  margin: 0 auto 2rem;
}

.create-channel-btn {
  background: linear-gradient(45deg, #10b981, #059669);
  color: white;
  padding: 0.875rem 2rem;
  border-radius: 14px;
  text-decoration: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
}

.create-channel-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
  color: white;
  text-decoration: none;
}

/* Channels Grid */
.channels-grid {
  display: grid;
  gap: 2rem;
}

.channel-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.channel-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Channel Header */
.channel-header {
  padding: 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
}

.channel-avatar {
  width: 56px;
  height: 56px;
  background: linear-gradient(45deg, #25d366, #128c7e);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.channel-info {
  flex: 1;
}

.channel-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.channel-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.channel-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-active {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.status-active .status-dot {
  background: #10b981;
}

.status-connecting {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.status-connecting .status-dot {
  background: #f59e0b;
}

.status-error {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.status-error .status-dot {
  background: #ef4444;
}

.status-inactive {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.status-inactive .status-dot {
  background: #9ca3af;
}

.channel-meta {
  display: flex;
  gap: 1.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.meta-item {
  display: flex;
  align-items: center;
}

.channel-actions {
  margin-left: auto;
}

.action-btn {
  background: linear-gradient(45deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

.action-btn.active {
  background: linear-gradient(45deg, #059669, #047857);
}

/* Webhook Form */
.webhook-form-section {
  border-bottom: 1px solid #e2e8f0;
}

.webhook-form {
  padding: 2rem;
  background: linear-gradient(135deg, #fefefe 0%, #f8fafc 100%);
}

.form-header {
  margin-bottom: 2rem;
}

.form-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
}

.form-subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.modern-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
}

.input-wrapper {
  position: relative;
}

.modern-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  background: white;
}

.modern-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 1rem;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.event-option {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.event-option:hover {
  border-color: #3b82f6;
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
  gap: 0.75rem;
  margin-left: 0.5rem;
}

.event-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #6b7280;
}

.event-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn-secondary,
.btn-primary {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: linear-gradient(45deg, #3b82f6, #1d4ed8);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-spinner .spinning {
  animation: spin 1s linear infinite;
}

/* Webhooks Section */
.webhooks-section {
  padding: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
}

.webhook-count {
  background: linear-gradient(45deg, #3b82f6, #1d4ed8);
  color: white;
  font-weight: 600;
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  min-width: 24px;
  text-align: center;
}

/* No Webhooks */
.no-webhooks {
  text-align: center;
  padding: 3rem 2rem;
  color: #9ca3af;
}

.no-webhooks-illustration {
  width: 64px;
  height: 64px;
  background: linear-gradient(45deg, #f3f4f6, #e5e7eb);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.5rem;
}

.no-webhooks-text {
  margin: 0;
  font-style: italic;
  font-size: 0.875rem;
}

/* Webhooks List */
.webhooks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.webhook-item {
  background: linear-gradient(135deg, #fefefe 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: all 0.3s ease;
}

.webhook-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.webhook-item.inactive {
  opacity: 0.6;
}

.webhook-status {
  margin-top: 0.5rem;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e5e7eb;
  transition: all 0.3s ease;
}

.status-indicator.active {
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.webhook-content {
  flex: 1;
}

.webhook-url {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.url-text {
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 0.875rem;
  color: #374151;
  flex: 1;
  padding: 0.5rem 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.webhook-badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  background: #f3f4f6;
  color: #6b7280;
}

.webhook-badge.active {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.webhook-events {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.event-badge {
  background: linear-gradient(45deg, #e0f2fe, #e1f5fe);
  color: #0369a1;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(3, 105, 161, 0.2);
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.event-badge-icon {
  font-size: 0.75rem;
}

.webhook-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.25rem;
}

.toggle-wrapper {
  display: flex;
  align-items: center;
}

.modern-toggle {
  margin: 0;
}

.delete-btn {
  background: linear-gradient(45deg, #ef4444, #dc2626);
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.delete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .webhooks-container {
    padding: 0;
  }

  .modern-header {
    padding: 2rem 1rem;
    margin-bottom: 1rem;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }

  .header-title {
    font-size: 2rem;
  }

  .header-stats {
    justify-content: center;
    width: 100%;
  }

  .stat-card {
    min-width: 140px;
  }

  .content-wrapper {
    padding: 0 1rem 1rem;
  }

  .channel-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
  }

  .channel-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .webhook-form {
    padding: 1.5rem;
  }

  .events-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .webhook-item {
    flex-direction: column;
    gap: 1rem;
  }

  .webhook-controls {
    justify-content: space-between;
    margin-top: 0;
  }
}

@media (max-width: 480px) {
  .header-stats {
    flex-direction: column;
    gap: 0.75rem;
  }

  .stat-card {
    width: 100%;
  }

  .webhook-url {
    flex-direction: column;
    align-items: flex-start;
  }

  .url-text {
    width: 100%;
  }
}
</style>
