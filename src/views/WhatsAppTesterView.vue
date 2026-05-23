<template>
  <div class="tester-container">
    <PageHeader
      title="API Tester"
      subtitle="Send any WhatsApp message type to debug payloads end-to-end"
      :icon="['fas', 'flask']"
      :breadcrumbs="[
        { label: 'WhatsApp', icon: ['fab', 'whatsapp'], to: '/' },
        { label: 'API Tester', icon: ['fas', 'flask'] },
      ]"
    />

    <main class="main-content">
      <div class="layout-grid">
        <!-- LEFT: form -->
        <section class="card form-card">
          <h3 class="card-title">
            <font-awesome-icon :icon="['fas', 'sliders']" />
            Request
          </h3>

          <div class="form-group">
            <label for="tester-channel" class="form-label">Channel</label>
            <select id="tester-channel" v-model="channelId" class="form-control">
              <option value="" disabled>— select a channel —</option>
              <option
                v-for="channel in channels"
                :key="channel.channelId"
                :value="channel.channelId"
              >
                {{ channel.name }} ({{ channel.phoneNumber || (channel.channelId ?? '').slice(0, 8) }})
                — {{ channel.status }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="tester-recipient" class="form-label">Recipient phone (intl format, no +)</label>
            <input
              id="tester-recipient"
              v-model="recipient"
              type="text"
              class="form-control"
              placeholder="51983724476"
            />
          </div>

          <div class="form-group">
            <label for="tester-type" class="form-label">Message type</label>
            <select id="tester-type" v-model="messageType" class="form-control">
              <option value="text">text</option>
              <option value="image">image</option>
              <option value="video">video</option>
              <option value="audio">audio (normal)</option>
              <option value="voice">audio (voice / PTT)</option>
              <option value="document">document / PDF</option>
              <option value="sticker">sticker</option>
              <option value="location">location</option>
              <option value="contact">contact (vCard)</option>
              <option value="reaction">reaction</option>
              <option value="interactive_button">interactive — buttons</option>
              <option value="interactive_list">interactive — list</option>
            </select>
          </div>

          <!-- Type-specific fields -->
          <template v-if="messageType === 'text'">
            <div class="form-group">
              <label for="tester-text" class="form-label">Message text</label>
              <textarea id="tester-text" v-model="form.text" rows="3" class="form-control" />
            </div>
          </template>

          <template v-if="isMediaType">
            <div class="form-group">
              <label for="tester-mediaSource" class="form-label">Media source</label>
              <select id="tester-mediaSource" v-model="form.mediaSource" class="form-control">
                <option value="link">URL (link)</option>
                <option value="data">Base64 (data)</option>
              </select>
            </div>
            <div class="form-group" v-if="form.mediaSource === 'link'">
              <label for="tester-link" class="form-label">Public URL</label>
              <input
                id="tester-link"
                v-model="form.link"
                type="text"
                class="form-control"
                :placeholder="mediaPlaceholder"
              />
            </div>
            <div class="form-group" v-else>
              <label for="tester-data" class="form-label">Base64 (raw, no data: prefix)</label>
              <textarea
                id="tester-data"
                v-model="form.data"
                rows="3"
                class="form-control"
                placeholder="iVBORw0KGgo..."
              />
              <label for="tester-mimeType" class="form-label mt-2">MIME type</label>
              <input
                id="tester-mimeType"
                v-model="form.mimeType"
                type="text"
                class="form-control"
                placeholder="image/png, application/pdf, etc."
              />
            </div>
            <div class="form-group" v-if="supportsCaption">
              <label for="tester-caption" class="form-label">Caption (optional)</label>
              <input id="tester-caption" v-model="form.caption" type="text" class="form-control" />
            </div>
            <div class="form-group" v-if="messageType === 'document'">
              <label for="tester-filename" class="form-label">Filename</label>
              <input
                id="tester-filename"
                v-model="form.filename"
                type="text"
                class="form-control"
                placeholder="document.pdf"
              />
            </div>
          </template>

          <template v-if="messageType === 'location'">
            <div class="form-row">
              <div class="form-group">
                <label for="tester-lat" class="form-label">Latitude</label>
                <input
                  id="tester-lat"
                  v-model.number="form.latitude"
                  type="number"
                  step="any"
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <label for="tester-lng" class="form-label">Longitude</label>
                <input
                  id="tester-lng"
                  v-model.number="form.longitude"
                  type="number"
                  step="any"
                  class="form-control"
                />
              </div>
            </div>
            <div class="form-group">
              <label for="tester-locName" class="form-label">Name (optional)</label>
              <input id="tester-locName" v-model="form.locationName" type="text" class="form-control" />
            </div>
            <div class="form-group">
              <label for="tester-address" class="form-label">Address (optional)</label>
              <input id="tester-address" v-model="form.address" type="text" class="form-control" />
            </div>
          </template>

          <template v-if="messageType === 'contact'">
            <div class="form-group">
              <label for="tester-contactFirst" class="form-label">First name</label>
              <input id="tester-contactFirst" v-model="form.contactFirst" type="text" class="form-control" />
            </div>
            <div class="form-group">
              <label for="tester-contactLast" class="form-label">Last name</label>
              <input id="tester-contactLast" v-model="form.contactLast" type="text" class="form-control" />
            </div>
            <div class="form-group">
              <label for="tester-contactPhone" class="form-label">Phone (e.g. +51928095231)</label>
              <input id="tester-contactPhone" v-model="form.contactPhone" type="text" class="form-control" />
            </div>
          </template>

          <template v-if="messageType === 'reaction'">
            <div class="form-group">
              <label for="tester-reactMsgId" class="form-label">Original message_id to react to</label>
              <input id="tester-reactMsgId" v-model="form.reactMessageId" type="text" class="form-control" placeholder="3EB0..." />
            </div>
            <div class="form-group">
              <label for="tester-emoji" class="form-label">Emoji</label>
              <input id="tester-emoji" v-model="form.emoji" type="text" class="form-control" maxlength="8" placeholder="🔥" />
            </div>
          </template>

          <template v-if="messageType === 'interactive_button'">
            <div class="form-group">
              <label for="tester-buttonBody" class="form-label">Body text</label>
              <textarea id="tester-buttonBody" v-model="form.body" rows="2" class="form-control" />
            </div>
            <div class="form-group">
              <label for="tester-buttonsRaw" class="form-label">Buttons (one per line — id|title)</label>
              <textarea
                id="tester-buttonsRaw"
                v-model="form.buttonsRaw"
                rows="3"
                class="form-control"
                placeholder="yes|Yes&#10;no|No"
              />
            </div>
          </template>

          <template v-if="messageType === 'interactive_list'">
            <div class="form-group">
              <label for="tester-listBody" class="form-label">Body text</label>
              <textarea id="tester-listBody" v-model="form.body" rows="2" class="form-control" />
            </div>
            <div class="form-group">
              <label for="tester-listButton" class="form-label">Button label</label>
              <input id="tester-listButton" v-model="form.listButton" type="text" class="form-control" />
            </div>
            <div class="form-group">
              <label for="tester-sectionTitle" class="form-label">Section title</label>
              <input id="tester-sectionTitle" v-model="form.sectionTitle" type="text" class="form-control" />
            </div>
            <div class="form-group">
              <label for="tester-rowsRaw" class="form-label">Rows (one per line — id|title|description?)</label>
              <textarea
                id="tester-rowsRaw"
                v-model="form.rowsRaw"
                rows="4"
                class="form-control"
                placeholder="opt1|Option 1|Detail&#10;opt2|Option 2"
              />
            </div>
          </template>

          <div class="form-group">
            <label class="form-label">
              <input v-model="useReply" type="checkbox" /> Reply to a previous message
            </label>
            <input
              v-if="useReply"
              id="tester-replyMsgId"
              v-model="replyMessageId"
              type="text"
              class="form-control mt-2"
              placeholder="context.message_id (3EB0...)"
              aria-label="Reply context message_id"
            />
          </div>

          <button
            class="btn btn-primary w-100"
            :disabled="!canSend || sending"
            @click="send"
          >
            <font-awesome-icon :icon="['fas', sending ? 'spinner' : 'paper-plane']" :spin="sending" />
            {{ sending ? 'Sending…' : 'Send' }}
          </button>
        </section>

        <!-- RIGHT: preview + response -->
        <section class="card preview-card">
          <h3 class="card-title">
            <font-awesome-icon :icon="['fas', 'code']" />
            Payload preview
          </h3>
          <pre class="code-block">{{ prettyPayload }}</pre>

          <h3 class="card-title mt-3">
            <font-awesome-icon :icon="['fas', 'reply']" />
            Response
          </h3>
          <div class="response-panel" aria-live="polite" aria-atomic="true">
            <div v-if="!response && !error" class="muted">
              No response yet — hit Send to see the result here.
            </div>
            <div v-if="response" class="response-ok">
              <div class="status-line success">✅ HTTP {{ response.status }}</div>
              <pre class="code-block">{{ JSON.stringify(response.data, null, 2) }}</pre>
            </div>
            <div v-if="error" class="response-err">
              <div class="status-line failure">
                ❌ HTTP {{ error.status ?? '—' }} — {{ error.summary }}
              </div>
              <pre class="code-block">{{ JSON.stringify(error.body, null, 2) }}</pre>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import axios from 'axios';
import PageHeader from '@/components/layout/PageHeader.vue';
import whatsappApi from '@/services/api';
import { API_CONFIG } from '@/config';

type ChannelRow = {
  channelId: string;
  name: string;
  status: string;
  phoneNumber?: string;
};

const channels = ref<ChannelRow[]>([]);
const channelId = ref('');
const recipient = ref('51983724476');
const messageType = ref<
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'voice'
  | 'document'
  | 'sticker'
  | 'location'
  | 'contact'
  | 'reaction'
  | 'interactive_button'
  | 'interactive_list'
>('text');

const useReply = ref(false);
const replyMessageId = ref('');

const form = reactive({
  // text
  text: 'Hello from the tester 👋',
  // media common
  mediaSource: 'link' as 'link' | 'data',
  link: '',
  data: '',
  mimeType: '',
  caption: '',
  filename: 'document.pdf',
  // location
  latitude: -12.046374,
  longitude: -77.042793,
  locationName: 'Lima',
  address: 'Perú',
  // contact
  contactFirst: 'Test',
  contactLast: 'Contact',
  contactPhone: '+51928095231',
  // reaction
  reactMessageId: '',
  emoji: '🔥',
  // interactive
  body: 'Choose one:',
  buttonsRaw: 'yes|Sí\nno|No',
  listButton: 'View options',
  sectionTitle: 'Options',
  rowsRaw: 'opt1|Option 1|Detail line\nopt2|Option 2',
});

const sending = ref(false);
const response = ref<{ status: number; data: unknown } | null>(null);
const error = ref<{ status?: number; summary: string; body: unknown } | null>(
  null,
);

const isMediaType = computed(() =>
  ['image', 'video', 'audio', 'voice', 'document', 'sticker'].includes(
    messageType.value,
  ),
);

const supportsCaption = computed(() =>
  ['image', 'video', 'document'].includes(messageType.value),
);

const mediaPlaceholder = computed(() => {
  switch (messageType.value) {
    case 'image':
      return 'https://example.com/photo.jpg';
    case 'video':
      return 'https://example.com/clip.mp4';
    case 'audio':
    case 'voice':
      return 'https://example.com/audio.ogg';
    case 'document':
      return 'https://example.com/file.pdf';
    case 'sticker':
      return 'https://example.com/sticker.webp';
    default:
      return '';
  }
});

const payload = computed<Record<string, unknown> | null>(() => {
  if (!recipient.value) return null;
  const base: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    to: recipient.value,
  };

  switch (messageType.value) {
    case 'text':
      Object.assign(base, { type: 'text', text: { body: form.text } });
      break;

    case 'image':
    case 'video':
    case 'sticker': {
      const media: Record<string, unknown> = buildMediaPayload();
      if (supportsCaption.value && form.caption) media.caption = form.caption;
      Object.assign(base, { type: messageType.value, [messageType.value]: media });
      break;
    }

    case 'audio': {
      const media: Record<string, unknown> = buildMediaPayload();
      Object.assign(base, { type: 'audio', audio: media });
      break;
    }

    case 'voice': {
      const media: Record<string, unknown> = { ...buildMediaPayload(), voice: true };
      Object.assign(base, { type: 'audio', audio: media });
      break;
    }

    case 'document': {
      const media: Record<string, unknown> = buildMediaPayload();
      if (form.filename) media.filename = form.filename;
      if (form.caption) media.caption = form.caption;
      Object.assign(base, { type: 'document', document: media });
      break;
    }

    case 'location':
      Object.assign(base, {
        type: 'location',
        location: {
          latitude: form.latitude,
          longitude: form.longitude,
          ...(form.locationName ? { name: form.locationName } : {}),
          ...(form.address ? { address: form.address } : {}),
        },
      });
      break;

    case 'contact':
      Object.assign(base, {
        type: 'contact',
        contacts: [
          {
            name: {
              first_name: form.contactFirst,
              last_name: form.contactLast,
              formatted_name: `${form.contactFirst} ${form.contactLast}`.trim(),
            },
            phones: [{ phone: form.contactPhone, type: 'CELL' }],
          },
        ],
      });
      break;

    case 'reaction':
      Object.assign(base, {
        type: 'reaction',
        reaction: { message_id: form.reactMessageId, emoji: form.emoji },
      });
      break;

    case 'interactive_button':
      Object.assign(base, {
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: form.body },
          action: { buttons: parseButtons(form.buttonsRaw) },
        },
      });
      break;

    case 'interactive_list':
      Object.assign(base, {
        type: 'interactive',
        interactive: {
          type: 'list',
          body: { text: form.body },
          action: {
            button: form.listButton,
            sections: [
              { title: form.sectionTitle, rows: parseRows(form.rowsRaw) },
            ],
          },
        },
      });
      break;
  }

  if (useReply.value && replyMessageId.value) {
    base.context = { message_id: replyMessageId.value };
  }

  return base;
});

const buildMediaPayload = (): Record<string, unknown> => {
  if (form.mediaSource === 'link') {
    return { link: form.link };
  }
  const out: Record<string, unknown> = { data: form.data };
  if (form.mimeType) out.mime_type = form.mimeType;
  return out;
};

const parseButtons = (raw: string) =>
  raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('|').map((part) => part.trim());
      const id = parts[0];
      const title = parts[1];
      return { id, title };
    })
    // WA Cloud API rejects buttons without title — drop incomplete rows
    // instead of sending `title: undefined` (would 400 the request).
    .filter((b) => b.id && b.title)
    .map((b) => ({ reply: { id: b.id, title: b.title } }));

const parseRows = (raw: string) =>
  raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('|').map((part) => part.trim());
      return { id: parts[0], title: parts[1], description: parts[2] };
    })
    // Same as buttons: id+title are mandatory; skip rows missing either.
    .filter((row) => row.id && row.title)
    .map((row) => {
      const out: Record<string, string> = { id: row.id, title: row.title };
      if (row.description) out.description = row.description;
      return out;
    });

const prettyPayload = computed(() =>
  payload.value ? JSON.stringify(payload.value, null, 2) : '// fill the form',
);

const canSend = computed(() => Boolean(channelId.value && payload.value));

const send = async () => {
  if (!payload.value || !channelId.value) return;
  sending.value = true;
  response.value = null;
  error.value = null;
  try {
    const url = `${API_CONFIG.BASE_URL}/api/whatsapp/channels/${channelId.value}/messages`;
    const res = await axios.post(url, payload.value, {
      timeout: API_CONFIG.TIMEOUT,
      validateStatus: () => true,
    });
    if (res.status >= 200 && res.status < 300) {
      response.value = { status: res.status, data: res.data };
    } else {
      error.value = {
        status: res.status,
        summary: `Server returned non-2xx`,
        body: res.data,
      };
    }
  } catch (e: any) {
    error.value = {
      status: e?.response?.status,
      summary: e?.message ?? 'Network error',
      body: e?.response?.data ?? null,
    };
  } finally {
    sending.value = false;
  }
};

onMounted(async () => {
  try {
    const res = await whatsappApi.getAllChannels();
    const channelRows = ((res as any)?.payload ?? []) as Array<any>;
    channels.value = channelRows.map((channel) => ({
      channelId: channel.channelId ?? channel._id,
      name: channel.name,
      status: channel.status,
      phoneNumber: channel.config?.phoneNumber ?? channel.phoneNumber,
    }));
    const firstActiveChannel = channels.value.find(
      (channel) => channel.status === 'active',
    );
    if (firstActiveChannel) channelId.value = firstActiveChannel.channelId;
  } catch (e) {
    console.error('Failed to load channels', e);
  }
});
</script>

<style scoped>
.tester-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f7f8fb;
}

.main-content {
  padding: 1.5rem;
  flex: 1;
}

.layout-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem;
  color: #1f2937;
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.375rem;
  color: #374151;
}

.form-control {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: inherit;
  background: #fff;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.form-control:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

textarea.form-control {
  resize: vertical;
  font-family: 'SFMono-Regular', Consolas, monospace;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-primary {
  background: #2563eb;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-primary:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

.w-100 {
  width: 100%;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-3 {
  margin-top: 1rem;
}

.code-block {
  background: #0f172a;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.8125rem;
  font-family: 'SFMono-Regular', Consolas, monospace;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0 0 0.75rem;
  max-height: 360px;
  overflow-y: auto;
}

.status-line {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.status-line.success {
  color: #16a34a;
}

.status-line.failure {
  color: #dc2626;
}

.muted {
  color: #6b7280;
  font-size: 0.875rem;
  font-style: italic;
}
</style>
