<template>
  <div class="telegram-channels-page">
    <div class="page-header">
      <h1 class="page-title">Telegram Ghost Channels</h1>
      <button @click="showCreateModal = true" class="btn btn-primary">
        <font-awesome-icon :icon="['fas', 'plus']" />
        Create Channel
      </button>
    </div>

    <div v-if="store.error" class="alert alert-danger">
      {{ store.error }}
    </div>

    <div v-if="store.isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading channels...</p>
    </div>

    <div v-else class="channels-grid">
      <div
        v-for="channel in store.channels"
        :key="channel.channelId"
        class="channel-card"
      >
        <div class="channel-header">
          <h3 class="channel-name">{{ channel.name }}</h3>
          <span
            class="channel-status"
            :class="`status-${channel.status}`"
          >
            {{ channel.status }}
          </span>
        </div>

        <div class="channel-details">
          <div class="detail-item">
            <font-awesome-icon :icon="['fas', 'phone']" />
            <span>{{ channel.phoneNumber }}</span>
          </div>
          <div class="detail-item">
            <font-awesome-icon :icon="['fas', 'clock']" />
            <span>{{ formatDate(channel.lastActivity) }}</span>
          </div>
        </div>

        <div class="channel-actions">
          <button
            v-if="channel.status !== 'authenticated'"
            @click="handleLogin(channel.channelId)"
            class="btn btn-sm btn-success"
            :disabled="store.loginModal.isVerifying"
          >
            <font-awesome-icon :icon="['fas', 'sign-in-alt']" />
            Login
          </button>
          <button
            @click="handleEdit(channel)"
            class="btn btn-sm btn-secondary"
          >
            <font-awesome-icon :icon="['fas', 'edit']" />
            Edit
          </button>
          <button
            @click="handleDelete(channel.channelId)"
            class="btn btn-sm btn-danger"
          >
            <font-awesome-icon :icon="['fas', 'trash']" />
            Delete
          </button>
        </div>
      </div>

      <div v-if="store.channels.length === 0" class="empty-state">
        <font-awesome-icon :icon="['fab', 'telegram']" class="empty-icon" />
        <h3>No Channels Yet</h3>
        <p>Create your first Telegram Ghost channel to get started</p>
        <button @click="showCreateModal = true" class="btn btn-primary">
          <font-awesome-icon :icon="['fas', 'plus']" />
          Create Channel
        </button>
      </div>
    </div>

    <!-- Create/Edit Channel Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="closeCreateModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ editingChannel ? 'Edit' : 'Create' }} Telegram Channel</h2>
          <button @click="closeCreateModal" class="btn-close">
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-body">
          <div class="form-group">
            <label for="name">Channel Name</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              class="form-control"
              placeholder="My Telegram Channel"
              required
            />
          </div>

          <div class="form-group">
            <label for="apiId">API ID</label>
            <input
              id="apiId"
              v-model.number="formData.apiId"
              type="number"
              class="form-control"
              placeholder="12345678"
              required
            />
          </div>

          <div class="form-group">
            <label for="apiHash">API Hash</label>
            <input
              id="apiHash"
              v-model="formData.apiHash"
              type="text"
              class="form-control"
              placeholder="abcdef1234567890"
              required
            />
          </div>

          <div class="form-group">
            <label for="phoneNumber">Phone Number</label>
            <input
              id="phoneNumber"
              v-model="formData.phoneNumber"
              type="tel"
              class="form-control"
              placeholder="+1234567890"
              required
            />
          </div>

          <div class="form-group">
            <label for="password2FA">2FA Password (Optional)</label>
            <input
              id="password2FA"
              v-model="formData.password2FA"
              type="password"
              class="form-control"
              placeholder="Enter if you have 2FA enabled"
            />
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeCreateModal" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Saving...' : (editingChannel ? 'Update' : 'Create') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Login Verification Modal -->
    <div v-if="store.loginModal.isOpen" class="modal-overlay" @click.self="closeLoginModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Verify Login Code</h2>
          <button @click="closeLoginModal" class="btn-close">
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
        </div>

        <div class="modal-body">
          <p class="verification-message">{{ store.loginModal.verificationStatus }}</p>

          <form @submit.prevent="handleVerifyLogin" v-if="!store.loginModal.showSuccess">
            <div class="form-group">
              <label for="phoneCode">Phone Code</label>
              <input
                id="phoneCode"
                v-model="loginForm.phoneCode"
                type="text"
                class="form-control"
                placeholder="12345"
                required
              />
            </div>

            <div class="form-group">
              <label for="password">2FA Password (if enabled)</label>
              <input
                id="password"
                v-model="loginForm.password"
                type="password"
                class="form-control"
                placeholder="Optional"
              />
            </div>

            <div class="modal-footer">
              <button type="button" @click="closeLoginModal" class="btn btn-secondary">
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="store.loginModal.isVerifying"
              >
                {{ store.loginModal.isVerifying ? 'Verifying...' : 'Verify' }}
              </button>
            </div>
          </form>

          <div v-else class="success-message">
            <font-awesome-icon :icon="['fas', 'check-circle']" class="success-icon" />
            <p>Successfully authenticated!</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTelegramGhostStore } from '@/store/telegramGhost';
import { useToast } from '@/composables/useToast';
import type { TelegramChannel } from '@/types/telegramGhost';

const store = useTelegramGhostStore();
const { success, error } = useToast();

const showCreateModal = ref(false);
const editingChannel = ref<TelegramChannel | null>(null);
const isSubmitting = ref(false);

const formData = ref({
  name: '',
  apiId: 0,
  apiHash: '',
  phoneNumber: '',
  password2FA: '',
});

const loginForm = ref({
  phoneCode: '',
  password: '',
});

const formatDate = (date?: string) => {
  if (!date) return 'Never';
  return new Date(date).toLocaleString();
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    if (editingChannel.value) {
      await store.updateChannel(editingChannel.value.channelId, formData.value);
      success('Channel updated successfully');
    } else {
      await store.createChannel(formData.value);
      success('Channel created successfully');
    }
    closeCreateModal();
    await store.fetchChannels();
  } catch (err: any) {
    error(err.message || 'Failed to save channel');
  } finally {
    isSubmitting.value = false;
  }
};

const handleEdit = (channel: TelegramChannel) => {
  editingChannel.value = channel;
  formData.value = {
    name: channel.name,
    apiId: channel.apiId,
    apiHash: channel.apiHash,
    phoneNumber: channel.phoneNumber,
    password2FA: channel.password2FA || '',
  };
  showCreateModal.value = true;
};

const handleDelete = async (channelId: string) => {
  if (confirm('Are you sure you want to delete this channel?')) {
    try {
      await store.deleteChannel(channelId);
      success('Channel deleted successfully');
    } catch (err: any) {
      error(err.message || 'Failed to delete channel');
    }
  }
};

const handleLogin = async (channelId: string) => {
  try {
    await store.initiateLogin(channelId);
  } catch (err: any) {
    error(err.message || 'Failed to initiate login');
  }
};

const handleVerifyLogin = async () => {
  try {
    await store.verifyLogin(
      store.loginModal.channelId,
      loginForm.value.phoneCode,
      loginForm.value.password || undefined
    );
    success('Login verified successfully');
    loginForm.value = { phoneCode: '', password: '' };
  } catch (err: any) {
    error(err.message || 'Failed to verify login');
  }
};

const closeCreateModal = () => {
  showCreateModal.value = false;
  editingChannel.value = null;
  formData.value = {
    name: '',
    apiId: 0,
    apiHash: '',
    phoneNumber: '',
    password2FA: '',
  };
};

const closeLoginModal = () => {
  store.closeLoginModal();
  loginForm.value = { phoneCode: '', password: '' };
};

onMounted(async () => {
  await store.fetchChannels();
});
</script>

<style scoped>
.telegram-channels-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.channels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.channel-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.channel-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.channel-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
}

.channel-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.channel-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-authenticated {
  background: #dcfce7;
  color: #166534;
}

.status-connected {
  background: #dbeafe;
  color: #1e40af;
}

.status-inactive {
  background: #f3f4f6;
  color: #6b7280;
}

.status-error {
  background: #fee2e2;
  color: #991b1b;
}

.channel-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.875rem;
}

.channel-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #64748b;
  color: white;
}

.btn-secondary:hover {
  background: #475569;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #475569;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #94a3b8;
  margin-bottom: 1.5rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #1e293b;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  padding: 0.25rem;
}

.btn-close:hover {
  color: #1e293b;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #475569;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.verification-message {
  background: #dbeafe;
  color: #1e40af;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.success-message {
  text-align: center;
  padding: 2rem;
}

.success-icon {
  font-size: 3rem;
  color: #10b981;
  margin-bottom: 1rem;
}

.loading-container {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.alert-danger {
  background: #fee2e2;
  color: #991b1b;
}
</style>
