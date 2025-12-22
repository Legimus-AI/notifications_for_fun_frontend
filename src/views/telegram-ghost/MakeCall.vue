<template>
  <div class="make-call-page">
    <div class="page-header">
      <h1 class="page-title">
        <font-awesome-icon :icon="['fas', 'phone']" />
        Make Ghost Call
      </h1>
    </div>

    <div class="content-card">
      <div class="info-banner">
        <font-awesome-icon :icon="['fas', 'info-circle']" />
        <div>
          <strong>Ghost Call</strong> - Makes a silent Telegram call that can wake up the recipient's phone.
          Perfect for urgent notifications or wake-up calls.
        </div>
      </div>

      <form @submit.prevent="handleMakeCall" class="call-form">
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
          <label for="wakeUpMessage">Wake Up Message (Optional)</label>
          <textarea
            id="wakeUpMessage"
            v-model="formData.wakeUpMessage"
            class="form-control"
            rows="4"
            placeholder="Optional message to send after the call..."
          ></textarea>
          <small class="form-text">This message will be sent after the ghost call</small>
        </div>

        <div class="form-group">
          <label for="ttsText">TTS Text (Optional)</label>
          <textarea
            id="ttsText"
            v-model="formData.ttsText"
            class="form-control"
            rows="4"
            placeholder="Text to be converted to speech during the call..."
          ></textarea>
          <small class="form-text">This text will be spoken using text-to-speech</small>
        </div>

        <div class="form-group">
          <label for="ttsVoice">TTS Voice (Optional)</label>
          <select
            id="ttsVoice"
            v-model="formData.ttsVoice"
            class="form-control"
          >
            <option value="">Default Voice</option>
            <option value="Puck">Puck</option>
            <option value="Badger">Badger</option>
            <option value="Celtic">Celtic</option>
            <option value="Kendra">Kendra</option>
            <option value="Salli">Salli</option>
            <option value="Raveena">Raveena</option>
            <option value="Ivy">Ivy</option>
            <option value="Justin">Justin</option>
            <option value="Matthew">Matthew</option>
            <option value="Joanna">Joanna</option>
            <option value="Kimberly">Kimberly</option>
            <option value="Amy">Amy</option>
            <option value="Brian">Brian</option>
            <option value="Emma">Emma</option>
            <option value="Russell">Russell</option>
            <option value="Nicole">Nicole</option>
            <option value="Filiz">Filiz</option>
            <option value="Geraint">Geraint</option>
            <option value="Aditi">Aditi</option>
            <option value="Emma">Emma</option>
            <option value="Naja">Naja</option>
            <option value="Mads">Mads</option>
            <option value="Hans">Hans</option>
            <option value="Marlene">Marlene</option>
            <option value="Mathieu">Mathieu</option>
            <option value="Celine">Celine</option>
            <option value="Chantal">Chantal</option>
          </select>
          <small class="form-text">Select voice for text-to-speech</small>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-success btn-lg"
            :disabled="isCalling || authenticatedChannels.length === 0"
          >
            <font-awesome-icon
              :icon="isCalling ? ['fas', 'spinner'] : ['fas', 'phone']"
              :class="{ spinning: isCalling }"
            />
            {{ isCalling ? 'Calling...' : 'Make Ghost Call' }}
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

const isCalling = ref(false);
const showHistory = ref(false);
const selectedIndex = ref(-1);
const formData = ref({
  channelId: '',
  recipient: '',
  wakeUpMessage: '',
  ttsText: '',
  ttsVoice: '',
});

const authenticatedChannels = computed(() => store.authenticatedChannels);

const filteredHistory = computed(() => {
  if (!formData.value.recipient) return history.value;
  return history.value.filter(r => 
    r.toLowerCase().includes(formData.value.recipient.toLowerCase())
  ).slice(0, 5);
});

const handleMakeCall = async () => {
  isCalling.value = true;
  try {
    // Create a plain object copy to avoid reactivity issues
    const dataToSend = {
      channelId: formData.value.channelId,
      recipient: formData.value.recipient,
      wakeUpMessage: formData.value.wakeUpMessage,
      ttsText: formData.value.ttsText,
      ttsVoice: formData.value.ttsVoice,
    };
    console.log('📞 Calling with data:', dataToSend);
    
    await store.makeCall(
      dataToSend.channelId,
      dataToSend.recipient,
      dataToSend.wakeUpMessage,
      dataToSend.ttsText,
      dataToSend.ttsVoice
    );
    success('Ghost call initiated successfully!');
    // Add recipient to history
    addRecipient(formData.value.recipient);
    // Reset optional fields but keep the recipient
    formData.value.wakeUpMessage = '';
    formData.value.ttsText = '';
    formData.value.ttsVoice = '';
  } catch (err: any) {
    console.error('❌ Call failed:', err);
    error(err.message || 'Failed to make ghost call');
  } finally {
    isCalling.value = false;
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
.make-call-page {
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

.info-banner {
  background: #dbeafe;
  border-left: 4px solid #3b82f6;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: start;
}

.info-banner svg {
  color: #3b82f6;
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.call-form {
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
  border-color: #10b981;
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

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
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
