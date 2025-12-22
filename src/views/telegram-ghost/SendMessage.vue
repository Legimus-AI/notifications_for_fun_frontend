<template>
  <div class="send-message-page">
    <div class="page-header">
      <h1 class="page-title">
        <font-awesome-icon :icon="['fas', 'paper-plane']" />
        Send Telegram Message
      </h1>
    </div>

    <div class="content-card">
      <form @submit.prevent="handleSendMessage" class="message-form">
        <div class="form-group">
          <label for="channel">Select Channel</label>
          <select
            id="channel"
            v-model="formData.channelId"
            class="form-control"
            required
          >
            <option value="">Choose a channel...</option>
            <option
              v-for="channel in authenticatedChannels"
              :key="channel.channelId"
              :value="channel.channelId"
            >
              {{ channel.name }} ({{ channel.phoneNumber }})
            </option>
          </select>
          <small v-if="authenticatedChannels.length === 0" class="text-warning">
            No authenticated channels available. Please login to a channel first.
          </small>
        </div>

        <div class="form-group">
          <label for="recipient">Recipient</label>
          <div class="recipient-input-wrapper">
            <input
              id="recipient"
              v-model="formData.recipient"
              type="text"
              class="form-control"
              placeholder="@username or phone number"
              required
              @focus="showHistory = true"
              @blur="hideHistory"
              @keydown.down="navigateHistory('down')"
              @keydown.up="navigateHistory('up')"
              @keydown.enter="selectHistoryItem"
            />
            <ul v-if="showHistory && filteredHistory.length > 0" class="recipient-history">
              <li
                v-for="(recipient, index) in filteredHistory"
                :key="recipient"
                :class="{ active: selectedIndex === index }"
                @mousedown="selectRecipient(recipient)"
              >
                <font-awesome-icon :icon="['fas', 'history']" />
                {{ recipient }}
              </li>
            </ul>
          </div>
          <small class="form-text">Enter username (with @) or phone number</small>
        </div>

        <div class="form-group">
          <label for="message">Message</label>
          <textarea
            id="message"
            v-model="formData.text"
            class="form-control"
            rows="6"
            placeholder="Type your message here..."
            required
          ></textarea>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary btn-lg"
            :disabled="isSending || authenticatedChannels.length === 0"
          >
            <font-awesome-icon
              :icon="isSending ? ['fas', 'spinner'] : ['fas', 'paper-plane']"
              :class="{ spinning: isSending }"
            />
            {{ isSending ? 'Sending...' : 'Send Message' }}
          </button>
        </div>
      </form>
    </div>

    <div v-if="store.error" class="alert alert-danger">
      {{ store.error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTelegramGhostStore } from '@/store/telegramGhost';
import { useToast } from '@/composables/useToast';
import { useRecipientHistory } from '@/composables/useRecipientHistory';

const store = useTelegramGhostStore();
const { success, error } = useToast();
const { history, addRecipient } = useRecipientHistory();

const isSending = ref(false);
const showHistory = ref(false);
const selectedIndex = ref(-1);
const formData = ref({
  channelId: '',
  recipient: '',
  text: '',
});

const authenticatedChannels = computed(() => store.authenticatedChannels);

const filteredHistory = computed(() => {
  if (!formData.value.recipient) return history.value;
  return history.value.filter(r => 
    r.toLowerCase().includes(formData.value.recipient.toLowerCase())
  ).slice(0, 5);
});

const handleSendMessage = async () => {
  isSending.value = true;
  try {
    await store.sendMessage(
      formData.value.channelId,
      formData.value.recipient,
      formData.value.text
    );
    success('Message sent successfully!');
    // Add recipient to history
    addRecipient(formData.value.recipient);
    // Reset only the message text, keep the recipient
    formData.value.text = '';
  } catch (err: any) {
    error(err.message || 'Failed to send message');
  } finally {
    isSending.value = false;
  }
};

const hideHistory = () => {
  setTimeout(() => {
    showHistory.value = false;
    selectedIndex.value = -1;
  }, 200);
};

const selectRecipient = (recipient: string) => {
  formData.value.recipient = recipient;
  showHistory.value = false;
  selectedIndex.value = -1;
};

const navigateHistory = (direction: 'up' | 'down') => {
  if (!showHistory.value) return;
  
  if (direction === 'down') {
    selectedIndex.value = Math.min(
      selectedIndex.value + 1,
      filteredHistory.value.length - 1
    );
  } else {
    selectedIndex.value = Math.max(selectedIndex.value - 1, -1);
  }
};

const selectHistoryItem = () => {
  if (selectedIndex.value >= 0 && filteredHistory.value[selectedIndex.value]) {
    selectRecipient(filteredHistory.value[selectedIndex.value]);
  }
};

onMounted(async () => {
  await store.fetchChannels();
});
</script>

<style scoped>
.send-message-page {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.content-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.message-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #475569;
}

.form-control {
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

textarea.form-control {
  resize: vertical;
  font-family: inherit;
}

.form-text {
  margin-top: 0.5rem;
  color: #64748b;
  font-size: 0.875rem;
}

.text-warning {
  color: #f59e0b;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.5rem;
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

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1.5rem;
}

.alert-danger {
  background: #fee2e2;
  color: #991b1b;
}

.recipient-input-wrapper {
  position: relative;
}

.recipient-history {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #cbd5e1;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  list-style: none;
  padding: 0;
  margin: 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.recipient-history li {
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #475569;
  transition: background-color 0.2s ease;
}

.recipient-history li:hover,
.recipient-history li.active {
  background: #f1f5f9;
  color: #1e293b;
}

.recipient-history li svg {
  color: #94a3b8;
  font-size: 0.875rem;
}
</style>
