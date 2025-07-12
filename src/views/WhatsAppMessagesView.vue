<template>
  <div class="whatsapp-messages-container">
    <!-- Page Header -->
    <PageHeader
      title="Messages"
      subtitle="View events from your WhatsApp channels"
      :icon="['fas', 'comments']"
      :breadcrumbs="[
        { label: 'WhatsApp', icon: ['fab', 'whatsapp'], to: '/' },
        { label: 'Messages', icon: ['fas', 'comments'] },
      ]"
    />

    <!-- Main Content -->
    <main class="main-content">
      <div class="content-grid">
        <!-- Channels Sidebar -->
        <aside class="channels-sidebar">
          <div class="sidebar-header">
            <h3 class="sidebar-title">
              <font-awesome-icon
                :icon="['fab', 'whatsapp']"
                class="sidebar-icon"
              />
              Channels
            </h3>
            <span class="channels-count">{{ channels.length }}</span>
          </div>

          <div class="channels-list">
            <div
              v-for="channel in channels"
              :key="channel.channelId"
              class="channel-card"
              :class="{
                'channel-card--selected':
                  selectedChannelId === channel.channelId,
              }"
              @click="selectChannel(channel.channelId)"
            >
              <div class="channel-info">
                <div class="channel-header">
                  <h4 class="channel-name">{{ channel.name }}</h4>
                  <span
                    class="status-badge"
                    :class="`status-badge--${getStatusClass(channel.status)}`"
                  >
                    <i class="status-dot"></i>
                    {{ formatStatus(channel.status) }}
                  </span>
                </div>
                <div class="channel-meta">
                  <span class="channel-id"
                    >{{ channel.channelId.slice(0, 8) }}...</span
                  >
                  <span v-if="channel.phoneNumber" class="channel-phone">
                    <font-awesome-icon :icon="['fas', 'phone']" />
                    {{ channel.phoneNumber }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="channelsLoading" class="loading-state">
              <div class="loading-spinner">
                <font-awesome-icon :icon="['fas', 'spinner']" spin />
              </div>
              <p>Loading channels...</p>
            </div>

            <!-- Empty State -->
            <div
              v-if="!channelsLoading && channels.length === 0"
              class="empty-state"
            >
              <font-awesome-icon
                :icon="['fab', 'whatsapp']"
                class="empty-icon"
              />
              <p>No channels available</p>
            </div>
          </div>
        </aside>

        <!-- Events Content -->
        <section class="events-content">
          <div
            v-if="selectedChannelId && selectedChannel"
            class="events-section"
          >
            <!-- Events Header -->
            <div class="events-header">
              <div class="events-title-section">
                <h2 class="events-title">
                  <font-awesome-icon
                    :icon="['fas', 'comments']"
                    class="events-icon"
                  />
                  Events for {{ selectedChannel.name }}
                </h2>
                <div class="events-stats">
                  <span class="stat-item">
                    <font-awesome-icon :icon="['fas', 'clock']" />
                    {{ events.length }} events
                  </span>
                  <span v-if="totalEvents > 0" class="stat-item">
                    <font-awesome-icon :icon="['fas', 'circle']" />
                    {{ totalEvents }} total
                  </span>
                </div>
              </div>

              <!-- Refresh Button -->
              <button
                class="refresh-btn"
                @click="refreshEvents"
                :disabled="eventsLoading"
              >
                <font-awesome-icon
                  :icon="['fas', 'sync']"
                  :spin="eventsLoading"
                />
                Refresh
              </button>
            </div>

            <!-- Events Table -->
            <div class="events-table-container">
              <div v-if="eventsLoading" class="loading-overlay">
                <div class="loading-spinner">
                  <font-awesome-icon :icon="['fas', 'spinner']" spin />
                </div>
                <p>Loading events...</p>
              </div>

              <div v-else-if="events.length > 0" class="events-table-wrapper">
                <table class="events-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Sender</th>
                      <th>Type</th>
                      <th>Message</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="event in events" :key="event._id">
                      <tr class="event-row">
                        <td class="time-cell">
                          <div class="time-info">
                            <span class="time-primary">{{
                              formatTime(event.createdAt)
                            }}</span>
                            <span class="time-secondary">{{
                              formatDate(event.createdAt)
                            }}</span>
                          </div>
                        </td>
                        <td class="sender-cell">
                          <div class="sender-info">
                            <div class="sender-avatar">
                              <font-awesome-icon
                                :icon="['fas', 'user-circle']"
                              />
                            </div>
                            <div class="sender-details">
                              <span class="sender-name">{{
                                getSender(event.payload)
                              }}</span>
                              <span class="sender-phone">{{
                                getPhoneNumber(event.payload)
                              }}</span>
                            </div>
                          </div>
                        </td>
                        <td class="type-cell">
                          <span
                            class="message-type-badge"
                            :class="`type-${getMessageType(
                              event.payload
                            ).toLowerCase()}`"
                          >
                            <font-awesome-icon
                              :icon="getMessageIcon(event.payload)"
                            />
                            {{ getMessageType(event.payload) }}
                          </span>
                        </td>
                        <td class="message-cell">
                          <div class="message-content">
                            <p class="message-text">
                              {{ getPreview(event.payload) }}
                            </p>
                          </div>
                        </td>
                        <td class="actions-cell">
                          <button
                            class="payload-toggle-btn"
                            @click="togglePayload(event._id)"
                            :class="{ active: expandedPayloads.has(event._id) }"
                            :title="
                              expandedPayloads.has(event._id)
                                ? 'Hide payload'
                                : 'Show payload'
                            "
                          >
                            <font-awesome-icon
                              :icon="[
                                'fas',
                                expandedPayloads.has(event._id)
                                  ? 'chevron-up'
                                  : 'chevron-down',
                              ]"
                            />
                          </button>
                        </td>
                      </tr>
                      <!-- Expanded Payload Row -->
                      <tr
                        v-if="expandedPayloads.has(event._id)"
                        class="payload-row"
                      >
                        <td colspan="5" class="payload-cell">
                          <div class="payload-container">
                            <div class="payload-header">
                              <h4 class="payload-title">
                                <font-awesome-icon :icon="['fas', 'code']" />
                                Complete Payload
                              </h4>
                              <div class="payload-actions">
                                <button
                                  class="copy-btn"
                                  @click="copyPayload(event.payload)"
                                  title="Copy payload to clipboard"
                                >
                                  <font-awesome-icon :icon="['fas', 'copy']" />
                                  Copy
                                </button>
                                <button
                                  class="close-payload-btn"
                                  @click="togglePayload(event._id)"
                                  title="Close payload"
                                >
                                  <font-awesome-icon :icon="['fas', 'times']" />
                                </button>
                              </div>
                            </div>
                            <div class="payload-content">
                              <pre class="payload-json">{{
                                formatPayload(event.payload)
                              }}</pre>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>

              <!-- Empty Events State -->
              <div v-else class="empty-events">
                <font-awesome-icon
                  :icon="['fas', 'comments']"
                  class="empty-icon"
                />
                <h3>No events found</h3>
                <p>This channel hasn't received any messages yet.</p>
              </div>
            </div>

            <!-- Pagination -->
            <nav v-if="totalPages > 1" class="pagination-nav">
              <div class="pagination-info">
                <span>Page {{ currentPage }} of {{ totalPages }}</span>
                <span class="pagination-total"
                  >{{ totalEvents }} total events</span
                >
              </div>
              <div class="pagination-controls">
                <button
                  class="pagination-btn pagination-btn--prev"
                  @click="prevPage"
                  :disabled="currentPage === 1"
                >
                  <font-awesome-icon :icon="['fas', 'chevron-left']" />
                  Previous
                </button>
                <button
                  class="pagination-btn pagination-btn--next"
                  @click="nextPage"
                  :disabled="currentPage >= totalPages"
                >
                  Next
                  <font-awesome-icon :icon="['fas', 'chevron-right']" />
                </button>
              </div>
            </nav>
          </div>

          <!-- No Channel Selected -->
          <div v-else class="no-selection">
            <div class="no-selection-content">
              <font-awesome-icon
                :icon="['fab', 'whatsapp']"
                class="no-selection-icon"
              />
              <h3>Select a Channel</h3>
              <p>
                Choose a WhatsApp channel from the sidebar to view its message
                events.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue";
import { useChannelStore } from "@/store/sessions";
import { useToast } from "@/composables/useToast";
import api from "@/services/api";
import type { WhatsAppChannel } from "@/types/sessions";
import type { WhatsAppEvent } from "@/types/whatsappEvents";
import PageHeader from "@/components/layout/PageHeader.vue";

const channelStore = useChannelStore();
const { error: showError, success } = useToast();

// State
const events = ref<WhatsAppEvent[]>([]);
const selectedChannelId = ref<string | null>(null);
const eventsLoading = ref(false);
const channelsLoading = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const totalEvents = ref(0);
const limit = 30;
const expandedPayloads = ref(new Set<string>());

// Computed
const channels = computed(() => channelStore.channels);
const selectedChannel = computed(() =>
  channels.value.find((c) => c.channelId === selectedChannelId.value)
);

// Methods
const selectChannel = (channelId: string) => {
  selectedChannelId.value = channelId;
  currentPage.value = 1;
};

const formatTime = (date: string | Date) => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const getSender = (payload: any) => {
  return payload.pushName || "Unknown";
};

const getPhoneNumber = (payload: any) => {
  const jid = payload.key?.remoteJid;
  if (jid) {
    return jid.split("@")[0];
  }
  return "";
};

const getMessageType = (payload: any) => {
  if (!payload.message) return "Unknown";
  const msg = payload.message;
  if (msg.conversation || msg.extendedTextMessage) return "Text";
  if (msg.stickerMessage) return "Sticker";
  if (msg.imageMessage) return "Image";
  if (msg.videoMessage) return "Video";
  if (msg.audioMessage) return "Audio";
  if (msg.documentMessage) return "Document";
  return "Other";
};

const getMessageIcon = (payload: any) => {
  const type = getMessageType(payload);
  switch (type) {
    case "Text":
      return ["fas", "comment"];
    case "Sticker":
      return ["fas", "smile"];
    case "Image":
      return ["fas", "image"];
    case "Video":
      return ["fas", "video"];
    case "Audio":
      return ["fas", "microphone"];
    case "Document":
      return ["fas", "file"];
    default:
      return ["fas", "question-circle"];
  }
};

const getPreview = (payload: any) => {
  if (!payload.message) return "No message content";
  const msg = payload.message;
  if (msg.conversation) return msg.conversation;
  if (msg.extendedTextMessage) return msg.extendedTextMessage.text;
  if (msg.stickerMessage) return "🎭 Sticker message";
  if (msg.imageMessage) return "📸 Image message";
  if (msg.videoMessage) return "🎥 Video message";
  if (msg.audioMessage) return "🎵 Audio message";
  if (msg.documentMessage) return "📄 Document message";
  return "Media message";
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "active":
    case "open":
      return "active";
    case "connecting":
      return "connecting";
    case "qr_ready":
    case "pairing_code_ready":
      return "ready";
    default:
      return "inactive";
  }
};

const formatStatus = (status: string) => {
  switch (status) {
    case "active":
    case "open":
      return "Active";
    case "connecting":
      return "Connecting";
    case "qr_ready":
      return "QR Ready";
    case "pairing_code_ready":
      return "Pairing Ready";
    default:
      return "Inactive";
  }
};

const fetchEvents = async () => {
  if (!selectedChannelId.value) return;

  eventsLoading.value = true;
  try {
    const params = {
      channelId: selectedChannelId.value,
      sort: "updatedAt",
      order: "desc",
      page: currentPage.value,
      limit: limit,
    };

    const response = await api.getWhatsAppEvents(params);
    if (response.ok && response.payload) {
      events.value = response.payload;
      totalEvents.value = response.totalDocs;
      totalPages.value = response.totalPages;
    }
  } catch (err: any) {
    showError(err.message || "Failed to fetch events");
  } finally {
    eventsLoading.value = false;
  }
};

const refreshEvents = async () => {
  await fetchEvents();
  success("Events refreshed successfully");
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const initialize = async () => {
  channelsLoading.value = true;
  try {
    await channelStore.fetchChannels();
    if (channels.value.length > 0) {
      selectedChannelId.value = channels.value[0].channelId;
    }
  } catch (err: any) {
    showError(err.message || "Failed to load channels");
  } finally {
    channelsLoading.value = false;
  }
};

const togglePayload = (eventId: string) => {
  if (expandedPayloads.value.has(eventId)) {
    expandedPayloads.value.delete(eventId);
  } else {
    expandedPayloads.value.add(eventId);
  }
};

const formatPayload = (payload: any) => {
  return JSON.stringify(payload, null, 2);
};

const copyPayload = async (payload: any) => {
  try {
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    success("Payload copied to clipboard");
  } catch (err) {
    showError("Failed to copy payload");
  }
};

// Watchers
watch(selectedChannelId, () => {
  currentPage.value = 1;
  fetchEvents();
});

watch(currentPage, fetchEvents);

// Lifecycle
onMounted(() => {
  initialize();
});
</script>

<style scoped>
.whatsapp-messages-container {
  min-height: 100vh;
  background: var(--color-background);
}

/* Remove old page header styles */
/* Page Header styles are now handled by the PageHeader component */

/* Main Content */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  min-height: 600px;
}

/* Channels Sidebar */
.channels-sidebar {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 0;
  height: fit-content;
  box-shadow: var(--shadow-sm);
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sidebar-icon {
  color: #25d366;
}

.channels-count {
  background: var(--color-primary);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.channels-list {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.channel-card {
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--color-background);
}

.channel-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.channel-card--selected {
  border-color: var(--color-primary);
  background: rgba(59, 130, 246, 0.05);
  box-shadow: var(--shadow-sm);
}

.channel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.channel-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge--active {
  background: rgba(34, 197, 94, 0.1);
  color: #059669;
}

.status-badge--connecting {
  background: rgba(251, 191, 36, 0.1);
  color: #d97706;
}

.status-badge--ready {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.status-badge--inactive {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.channel-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.channel-id {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  font-family: monospace;
}

.channel-phone {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Events Content */
.events-content {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.events-section {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.events-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.events-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.events-icon {
  color: #25d366;
}

.events-stats {
  display: flex;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Events Table */
.events-table-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  z-index: 10;
}

.loading-spinner {
  font-size: 2rem;
  color: var(--color-primary);
}

.events-table-wrapper {
  overflow-x: auto;
  max-height: 600px;
  overflow-y: auto;
}

.events-table {
  width: 100%;
  border-collapse: collapse;
}

.events-table th {
  background: var(--color-background);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--color-text-primary);
  border-bottom: 2px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 5;
}

.events-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  vertical-align: top;
}

.event-row:hover {
  background: var(--color-background);
}

.time-cell {
  width: 120px;
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.time-primary {
  font-weight: 600;
  color: var(--color-text-primary);
}

.time-secondary {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.sender-cell {
  width: 200px;
}

.sender-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sender-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.sender-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sender-name {
  font-weight: 600;
  color: var(--color-text-primary);
}

.sender-phone {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  font-family: monospace;
}

.type-cell {
  width: 120px;
}

.message-type-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  width: fit-content;
}

.type-text {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.type-sticker {
  background: rgba(251, 191, 36, 0.1);
  color: #d97706;
}

.type-image {
  background: rgba(34, 197, 94, 0.1);
  color: #059669;
}

.type-video {
  background: rgba(168, 85, 247, 0.1);
  color: #7c3aed;
}

.type-audio {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.type-document {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.type-other {
  background: rgba(156, 163, 175, 0.1);
  color: #9ca3af;
}

.message-content {
  max-width: 300px;
}

.message-text {
  margin: 0;
  line-height: 1.4;
  color: var(--color-text-primary);
  word-wrap: break-word;
}

/* Actions Column */
.actions-cell {
  width: 80px;
  text-align: center;
}

.payload-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0 auto;
}

.payload-toggle-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.payload-toggle-btn.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* Payload Expansion */
.payload-row {
  background: var(--color-background);
}

.payload-cell {
  padding: 0 !important;
}

.payload-container {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin: 0.5rem;
  overflow: hidden;
}

.payload-header {
  background: var(--color-surface);
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.payload-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.payload-actions {
  display: flex;
  gap: 0.5rem;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: var(--color-primary-hover);
}

.close-payload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-payload-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.payload-content {
  max-height: 300px;
  overflow-y: auto;
  background: #1e1e1e;
  position: relative;
}

.payload-json {
  margin: 0;
  padding: 1rem;
  background: #1e1e1e;
  color: #d4d4d4;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 0.875rem;
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
  border: none;
  overflow-x: auto;
  min-height: 100px;
}

/* Pagination */
.pagination-nav {
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pagination-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.pagination-total {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.pagination-controls {
  display: flex;
  gap: 0.5rem;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Empty States */
.no-selection,
.empty-events {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.no-selection-content {
  max-width: 300px;
}

.no-selection-icon,
.empty-icon {
  font-size: 4rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

.no-selection h3,
.empty-events h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 0.5rem 0;
}

.no-selection p,
.empty-events p {
  color: var(--color-text-secondary);
  margin: 0;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: var(--color-text-secondary);
}

.loading-state .loading-spinner,
.empty-state .empty-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .main-content {
    padding: 1rem;
  }

  .events-table-wrapper {
    max-height: 400px;
  }

  .pagination-nav {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .pagination-controls {
    justify-content: center;
  }
}
</style>
