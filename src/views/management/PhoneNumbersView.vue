<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h1 class="page-title">Phone Numbers</h1>
        <p class="page-description">
          View and manage connected WhatsApp channels and phone numbers.
        </p>
      </div>
    </header>

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div
            class="card-header d-flex justify-content-between align-items-center"
          >
            <h5 class="card-title mb-0">Connected Channels</h5>
          </div>
          <div
            v-if="isLoading && !channels.length"
            class="card-body text-center"
          >
            <div class="spinner-border" role="status"></div>
          </div>
          <div v-else-if="channels.length === 0" class="card-body text-center">
            <p class="text-muted">No WhatsApp channels connected yet.</p>
            <router-link to="/" class="btn btn-primary">
              Go to Dashboard to Create Channel
            </router-link>
          </div>
          <ul v-else class="list-group list-group-flush">
            <li
              v-for="channel in channels"
              :key="channel.id"
              class="list-group-item d-flex justify-content-between align-items-center px-4 py-3"
            >
              <div>
                <h6 class="mb-0 fw-bold">
                  {{ channel.name }}
                </h6>
                <small class="text-muted">
                  ID: {{ channel.channelId }} | Status:
                  {{ formatStatus(channel.status) }} | Last Activity:
                  {{ formatLastActivity(channel.lastActivity) }}
                </small>
              </div>
              <div class="d-flex align-items-center gap-2">
                <span :class="['badge', getStatusBadgeClass(channel.status)]">
                  {{ formatStatus(channel.status) }}
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useChannelStore } from "@/store/sessions";
import { storeToRefs } from "pinia";
import type { ChannelStatus } from "@/types/sessions";

// Store
const channelStore = useChannelStore();

// Refs from store
const { channels, isLoading } = storeToRefs(channelStore);

// Methods
const initialize = () => {
  channelStore.fetchChannels();
};

const formatStatus = (status: ChannelStatus): string => {
  switch (status) {
    case "inactive":
      return "Inactive";
    case "connecting":
      return "Connecting";
    case "qr_ready":
      return "QR Ready";
    case "pairing_code_ready":
      return "Pairing Code Ready";
    case "active":
      return "Active";
    case "error":
      return "Error";
    case "logged_out":
      return "Logged Out";
    default:
      return status;
  }
};

const getStatusBadgeClass = (status: ChannelStatus): string => {
  switch (status) {
    case "active":
      return "text-bg-success";
    case "connecting":
    case "qr_ready":
    case "pairing_code_ready":
      return "text-bg-warning";
    case "inactive":
    case "logged_out":
      return "text-bg-secondary";
    case "error":
      return "text-bg-danger";
    default:
      return "text-bg-secondary";
  }
};

const formatLastActivity = (lastActivity?: string): string => {
  if (!lastActivity) return "Never";

  const date = new Date(lastActivity);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minutes ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
};

onMounted(initialize);
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.page-title {
  font-size: 2rem;
  font-weight: 700;
}
.page-description {
  color: var(--text-secondary);
}
.list-group-item:last-child {
  border-bottom: none;
}
.card-header {
  background-color: #f9fafb;
}
</style>
