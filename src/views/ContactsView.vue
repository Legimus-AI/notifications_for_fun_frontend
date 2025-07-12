<template>
  <div class="contacts-view">
    <!-- Header -->
    <div class="header-section">
      <div class="container-fluid">
        <div class="row align-items-center">
          <div class="col">
            <h1 class="page-title">
              <font-awesome-icon :icon="['fas', 'address-book']" class="me-3" />
              Contact Management
            </h1>
            <p class="page-subtitle">
              Search and manage WhatsApp contacts across your channels
            </p>
          </div>
          <div class="col-auto">
            <button
              @click="clearAllData"
              class="modern-btn btn-outline-danger"
              :disabled="!contacts.length"
            >
              <font-awesome-icon :icon="['fas', 'trash']" class="me-2" />
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div class="container-fluid">
        <!-- Search Section -->
        <div class="modern-card search-section">
          <div class="card-body">
            <div class="row">
              <div class="col-lg-6">
                <h5 class="card-title mb-4">
                  <font-awesome-icon :icon="['fas', 'search']" class="me-2" />
                  Search Contact
                </h5>

                <form @submit.prevent="searchContact" class="search-form">
                  <div class="mb-3">
                    <label for="channelSelect" class="form-label"
                      >Select Channel</label
                    >
                    <select
                      id="channelSelect"
                      v-model="selectedChannelId"
                      class="form-select"
                      required
                    >
                      <option value="">Choose a channel...</option>
                      <option
                        v-for="channel in activeChannels"
                        :key="channel.id"
                        :value="channel.id"
                      >
                        {{ channel.name }} - {{ channel.phoneNumber }}
                      </option>
                    </select>
                  </div>

                  <div class="mb-3">
                    <label for="phoneInput" class="form-label"
                      >Phone Number</label
                    >
                    <div class="input-group">
                      <span class="input-group-text">+</span>
                      <input
                        id="phoneInput"
                        v-model="searchPhoneNumber"
                        type="tel"
                        class="form-control"
                        placeholder="1234567890"
                        required
                        pattern="[0-9]+"
                        title="Please enter numbers only"
                      />
                      <button
                        type="submit"
                        class="modern-btn btn-primary"
                        :disabled="
                          loading || !selectedChannelId || !searchPhoneNumber
                        "
                      >
                        <font-awesome-icon
                          :icon="
                            loading ? ['fas', 'spinner'] : ['fas', 'search']
                          "
                          :spin="loading"
                          class="me-2"
                        />
                        Search
                      </button>
                    </div>
                    <div class="form-text">
                      Enter phone number including country code (without +)
                    </div>
                  </div>
                </form>
              </div>

              <!-- Recent Searches -->
              <div class="col-lg-6" v-if="recentSearches.length">
                <h5 class="card-title mb-4">
                  <font-awesome-icon :icon="['fas', 'history']" class="me-2" />
                  Recent Searches
                </h5>

                <div class="recent-searches">
                  <div
                    v-for="phone in recentSearches"
                    :key="phone"
                    class="recent-search-item"
                    @click="searchPhoneNumber = phone"
                  >
                    <span class="phone-number">+{{ phone }}</span>
                    <button
                      @click.stop="removeFromSearchHistory(phone)"
                      class="btn btn-sm btn-outline-danger"
                    >
                      <font-awesome-icon :icon="['fas', 'times']" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Alert -->
        <div
          v-if="storeError"
          class="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          <font-awesome-icon
            :icon="['fas', 'exclamation-triangle']"
            class="me-2"
          />
          {{ storeError }}
          <button
            type="button"
            class="btn-close"
            @click="storeError = null"
          ></button>
        </div>

        <!-- Contacts Results -->
        <div v-if="contacts.length" class="contacts-section">
          <h4 class="section-title mb-4">
            <font-awesome-icon :icon="['fas', 'users']" class="me-2" />
            Contact Results ({{ contacts.length }})
          </h4>

          <div class="row">
            <div
              v-for="contact in contacts"
              :key="contact.jid"
              class="col-lg-6 col-xl-4 mb-4"
            >
              <div class="modern-card contact-card">
                <div class="card-body">
                  <!-- Profile Picture -->
                  <div class="contact-avatar-section">
                    <div class="contact-avatar">
                      <img
                        v-if="contact.profilePicture"
                        :src="contact.profilePicture"
                        :alt="contact.name || contact.phoneNumber"
                        class="avatar-img"
                        @error="onImageError"
                      />
                      <font-awesome-icon
                        v-else
                        :icon="['fas', 'user-circle']"
                        class="avatar-placeholder"
                      />
                    </div>
                    <button
                      @click="loadProfilePicture(contact)"
                      class="btn btn-sm btn-outline-primary load-photo-btn"
                      :disabled="loading"
                      title="Load Profile Picture"
                    >
                      <font-awesome-icon :icon="['fas', 'camera']" />
                    </button>
                  </div>

                  <!-- Contact Info -->
                  <div class="contact-info">
                    <h6 class="contact-name">
                      {{ contact.name || "Unknown" }}
                    </h6>
                    <p class="contact-phone">+{{ contact.phoneNumber }}</p>

                    <!-- Status Badges -->
                    <div class="status-badges mb-3">
                      <span
                        v-if="contact.exists !== undefined"
                        :class="[
                          'status-badge',
                          contact.exists ? 'status-success' : 'status-danger',
                        ]"
                      >
                        <font-awesome-icon
                          :icon="
                            contact.exists
                              ? ['fas', 'check-circle']
                              : ['fas', 'times-circle']
                          "
                          class="me-1"
                        />
                        {{ contact.exists ? "Exists" : "Not Found" }}
                      </span>

                      <span
                        v-if="contact.isWhatsAppUser !== undefined"
                        :class="[
                          'status-badge',
                          contact.isWhatsAppUser
                            ? 'status-success'
                            : 'status-warning',
                        ]"
                      >
                        <font-awesome-icon
                          :icon="['fab', 'whatsapp']"
                          class="me-1"
                        />
                        {{
                          contact.isWhatsAppUser
                            ? "WhatsApp User"
                            : "Not on WhatsApp"
                        }}
                      </span>

                      <span
                        v-if="contact.isOnline !== undefined"
                        :class="[
                          'status-badge',
                          contact.isOnline
                            ? 'status-success'
                            : 'status-secondary',
                        ]"
                      >
                        <font-awesome-icon
                          :icon="
                            contact.isOnline
                              ? ['fas', 'circle']
                              : ['far', 'circle']
                          "
                          class="me-1"
                        />
                        {{ contact.isOnline ? "Online" : "Offline" }}
                      </span>
                    </div>

                    <!-- Status Message -->
                    <div v-if="contact.status" class="contact-status mb-2">
                      <small class="text-muted">
                        <font-awesome-icon
                          :icon="['fas', 'quote-left']"
                          class="me-1"
                        />
                        {{ contact.status }}
                      </small>
                    </div>

                    <!-- Last Seen -->
                    <div v-if="contact.lastSeen" class="contact-last-seen mb-3">
                      <small class="text-muted">
                        <font-awesome-icon
                          :icon="['fas', 'clock']"
                          class="me-1"
                        />
                        Last seen: {{ formatDate(contact.lastSeen) }}
                      </small>
                    </div>

                    <!-- Action Buttons -->
                    <div class="contact-actions">
                      <button
                        @click="loadContactStatus(contact)"
                        class="btn btn-sm btn-outline-info me-2"
                        :disabled="loading"
                        title="Refresh Status"
                      >
                        <font-awesome-icon :icon="['fas', 'sync']" />
                      </button>

                      <button
                        @click="copyJid(contact.jid)"
                        class="btn btn-sm btn-outline-secondary"
                        title="Copy JID"
                      >
                        <font-awesome-icon :icon="['fas', 'copy']" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!loading" class="empty-state">
          <div class="text-center">
            <font-awesome-icon :icon="['fas', 'search']" class="empty-icon" />
            <h4>No Contacts Found</h4>
            <p class="text-muted">Search for a phone number to get started</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { storeToRefs } from "pinia";
import { useContactStore } from "@/store/contacts";
import { useChannelStore } from "@/store/sessions";
import { useToast } from "@/composables/useToast";
import type { Contact } from "@/types/contacts";

// Stores
const contactStore = useContactStore();
const channelStore = useChannelStore();
const { success, error, warning } = useToast();

// Store refs
const {
  contacts,
  loading,
  error: storeError,
  recentSearches,
} = storeToRefs(contactStore);
const { channels } = storeToRefs(channelStore);

// Local state
const selectedChannelId = ref("");
const searchPhoneNumber = ref("");

// Computed
const activeChannels = computed(() => {
  return channels.value.filter(
    (channel) =>
      channel.status === "connected" || channel.status === "authenticated"
  );
});

// Methods
const initialize = async () => {
  try {
    await channelStore.fetchChannels();
  } catch (e: any) {
    error(e.message || "Failed to load channels");
  }
};

const searchContact = async () => {
  if (!selectedChannelId.value || !searchPhoneNumber.value) {
    warning("Please select a channel and enter a phone number");
    return;
  }

  try {
    const result = await contactStore.checkContact(
      selectedChannelId.value,
      searchPhoneNumber.value
    );

    if (result.exists) {
      success(`Contact found: ${result.name || searchPhoneNumber.value}`);
    } else {
      warning("Contact not found");
    }
  } catch (e: any) {
    error(e.message || "Failed to search contact");
  }
};

const loadContactStatus = async (contact: Contact) => {
  if (!selectedChannelId.value) {
    warning("Please select a channel");
    return;
  }

  try {
    await contactStore.getContactStatus(selectedChannelId.value, contact.jid);
    success("Status updated");
  } catch (e: any) {
    error(e.message || "Failed to load status");
  }
};

const loadProfilePicture = async (contact: Contact) => {
  if (!selectedChannelId.value) {
    warning("Please select a channel");
    return;
  }

  try {
    await contactStore.getContactProfilePicture(
      selectedChannelId.value,
      contact.jid
    );
    success("Profile picture loaded");
  } catch (e: any) {
    error(e.message || "Failed to load profile picture");
  }
};

const copyJid = async (jid: string) => {
  try {
    await navigator.clipboard.writeText(jid);
    success("JID copied to clipboard");
  } catch (e) {
    error("Failed to copy JID");
  }
};

const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = "none";
};

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleString();
  } catch (e) {
    return dateString;
  }
};

const clearAllData = () => {
  contactStore.clearContacts();
  contactStore.clearSearchHistory();
  success("All data cleared");
};

const removeFromSearchHistory = (phoneNumber: string) => {
  contactStore.removeFromSearchHistory(phoneNumber);
  success("Removed from history");
};

// Lifecycle
onMounted(initialize);
</script>

<style scoped>
.contacts-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.header-section {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  padding: var(--spacing-2xl) 0;
  margin-bottom: var(--spacing-xl);
  position: relative;
  overflow: hidden;
}

.header-section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-subtitle {
  font-size: 1.1rem;
  margin: var(--spacing-sm) 0 0 0;
  opacity: 0.9;
}

.main-content {
  position: relative;
  z-index: 1;
}

.search-section {
  margin-bottom: var(--spacing-xl);
}

.search-form .input-group {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.search-form .form-control,
.search-form .form-select {
  border: 2px solid #e5e7eb;
  padding: 0.75rem 1rem;
  font-size: 1rem;
}

.search-form .form-control:focus,
.search-form .form-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
}

.recent-searches {
  max-height: 200px;
  overflow-y: auto;
}

.recent-search-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  margin-bottom: var(--spacing-xs);
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.recent-search-item:hover {
  background: #e5e7eb;
  transform: translateX(2px);
}

.phone-number {
  font-family: "Courier New", monospace;
  font-weight: 600;
  color: #374151;
}

.contacts-section {
  margin-top: var(--spacing-xl);
}

.section-title {
  color: #374151;
  font-weight: 700;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: var(--spacing-sm);
}

.contact-card {
  height: 100%;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
}

.contact-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.contact-avatar-section {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-md);
  position: relative;
}

.contact-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--spacing-sm);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 3rem;
  color: #9ca3af;
}

.load-photo-btn {
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.contact-info {
  text-align: center;
}

.contact-name {
  font-weight: 700;
  color: #374151;
  margin-bottom: var(--spacing-xs);
  font-size: 1.1rem;
}

.contact-phone {
  font-family: "Courier New", monospace;
  color: #6b7280;
  margin-bottom: var(--spacing-md);
  font-weight: 600;
}

.status-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  justify-content: center;
}

.contact-status,
.contact-last-seen {
  text-align: center;
}

.contact-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-xs);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
  margin-top: var(--spacing-xl);
}

.empty-icon {
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: var(--spacing-lg);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .contact-avatar {
    width: 60px;
    height: 60px;
  }

  .avatar-placeholder {
    font-size: 2rem;
  }
}
</style>
