<template>
  <!-- QR Code Modal -->
  <Teleport to="body">
    <div
      v-if="qrCodeModal.isOpen"
      class="modal-overlay"
      @click="channelStore.hideQrCode"
    >
      <div class="modal-container" @click.stop>
        <div
          class="modal-content"
          :class="{ 'success-mode': qrCodeModal.showSuccess }"
        >
          <!-- Header -->
          <div class="modal-header">
            <div class="header-content">
              <div class="status-icon" :class="headerStatusClass">
                <svg
                  v-if="qrCodeModal.showSuccess"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                <svg
                  v-else-if="qrCodeModal.isConnecting"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="spin"
                >
                  <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                </svg>
                <svg
                  v-else
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M3,11H5V13H3V11M11,5H13V9H11V5M9,11H13V15H9V11M15,11H17V13H15V11M19,11H21V13H19V11M5,11H7V13H5V11M11,19H13V21H11V19M5,19H7V21H5V19M15,19H17V21H15V19M11,1H13V3H11V1M19,1H21V3H19V1M19,5H21V9H19V5M5,1H7V3H5V1M3,5H5V9H3V5M5,15H7V17H5V15M19,15H21V17H19V15"
                  />
                </svg>
              </div>

              <div class="header-text">
                <h2 class="modal-title">
                  <span v-if="qrCodeModal.showSuccess"
                    >Connected Successfully!</span
                  >
                  <span v-else-if="qrCodeModal.isConnecting"
                    >Connecting...</span
                  >
                  <span v-else>Scan QR Code</span>
                </h2>
                <p class="modal-subtitle">
                  Channel:
                  <span class="channel-id">{{ qrCodeModal.channelId }}</span>
                </p>
              </div>
            </div>

            <button class="close-button" @click="channelStore.hideQrCode">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="modal-body">
            <!-- Success State -->
            <div v-if="qrCodeModal.showSuccess" class="success-state">
              <div class="celebration-icon">🎉</div>
              <h3>WhatsApp Connected!</h3>
              <p>Your channel is now active and ready to send messages.</p>
              <div class="auto-close-indicator">
                <div class="progress-ring">
                  <svg width="40" height="40">
                    <circle
                      cx="20"
                      cy="20"
                      r="18"
                      stroke="#e5e7eb"
                      stroke-width="2"
                      fill="none"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r="18"
                      stroke="#10b981"
                      stroke-width="2"
                      fill="none"
                      stroke-dasharray="113"
                      stroke-dashoffset="113"
                      class="progress-circle"
                    />
                  </svg>
                </div>
                <span class="auto-close-text">Auto-closing...</span>
              </div>
            </div>

            <!-- Loading/QR State -->
            <div v-else class="qr-state">
              <!-- Connection Status -->
              <div
                v-if="qrCodeModal.connectionStatus"
                class="connection-status"
              >
                <div
                  class="status-pill"
                  :class="getStatusClass(qrCodeModal.connectionStatus)"
                >
                  <div class="status-dot"></div>
                  <span>{{
                    formatConnectionStatus(qrCodeModal.connectionStatus)
                  }}</span>
                </div>
              </div>

              <!-- QR Code Container -->
              <div class="qr-section">
                <div
                  v-if="qrCodeModal.qrCode && !qrCodeModal.isConnecting"
                  class="qr-container"
                >
                  <div class="qr-frame">
                    <img :src="qrCodeModal.qrCode" alt="WhatsApp QR Code" />
                    <div class="qr-corners">
                      <div class="corner corner-tl"></div>
                      <div class="corner corner-tr"></div>
                      <div class="corner corner-bl"></div>
                      <div class="corner corner-br"></div>
                    </div>
                  </div>
                </div>

                <div v-else class="loading-state">
                  <div class="loading-animation">
                    <div class="loading-circle"></div>
                    <div class="loading-circle"></div>
                    <div class="loading-circle"></div>
                  </div>
                  <p class="loading-message">
                    {{
                      qrCodeModal.qrCode
                        ? "Waiting for scan..."
                        : "Generating QR code..."
                    }}
                  </p>
                </div>
              </div>

              <!-- Instructions -->
              <div
                v-if="qrCodeModal.qrCode && !qrCodeModal.isConnecting"
                class="instructions-card"
              >
                <div class="instructions-header">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"
                    />
                  </svg>
                  How to Connect
                </div>
                <ol class="instruction-steps">
                  <li>Open <strong>WhatsApp</strong> on your phone</li>
                  <li>Go to <strong>Settings → Linked Devices</strong></li>
                  <li>Tap <strong>"Link a Device"</strong></li>
                  <li>Point your camera at the QR code above</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Pairing Code Modal -->
  <Teleport to="body">
    <div
      v-if="pairingCodeModal.isOpen"
      class="modal-overlay"
      @click="channelStore.hidePairingCode"
    >
      <div class="modal-container" @click.stop>
        <div
          class="modal-content"
          :class="{ 'success-mode': pairingCodeModal.showSuccess }"
        >
          <!-- Header -->
          <div class="modal-header">
            <div class="header-content">
              <div class="status-icon" :class="headerStatusClassPairing">
                <svg
                  v-if="pairingCodeModal.showSuccess"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                <svg
                  v-else-if="pairingCodeModal.isConnecting"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="spin"
                >
                  <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                </svg>
                <svg
                  v-else
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"
                  />
                </svg>
              </div>

              <div class="header-text">
                <h2 class="modal-title">
                  <span v-if="pairingCodeModal.showSuccess"
                    >Connected Successfully!</span
                  >
                  <span v-else-if="pairingCodeModal.isConnecting"
                    >Connecting...</span
                  >
                  <span v-else>Pairing Code</span>
                </h2>
                <p class="modal-subtitle">
                  Channel:
                  <span class="channel-id">{{
                    pairingCodeModal.channelId
                  }}</span>
                </p>
              </div>
            </div>

            <button class="close-button" @click="channelStore.hidePairingCode">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="modal-body">
            <!-- Success State -->
            <div v-if="pairingCodeModal.showSuccess" class="success-state">
              <div class="celebration-icon">🎉</div>
              <h3>WhatsApp Connected!</h3>
              <p>Your channel is now active and ready to send messages.</p>
              <div class="auto-close-indicator">
                <div class="progress-ring">
                  <svg width="40" height="40">
                    <circle
                      cx="20"
                      cy="20"
                      r="18"
                      stroke="#e5e7eb"
                      stroke-width="2"
                      fill="none"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r="18"
                      stroke="#10b981"
                      stroke-width="2"
                      fill="none"
                      stroke-dasharray="113"
                      stroke-dashoffset="113"
                      class="progress-circle"
                    />
                  </svg>
                </div>
                <span class="auto-close-text">Auto-closing...</span>
              </div>
            </div>

            <!-- Pairing Code State -->
            <div v-else class="pairing-state">
              <!-- Connection Status -->
              <div
                v-if="pairingCodeModal.connectionStatus"
                class="connection-status"
              >
                <div
                  class="status-pill"
                  :class="getStatusClass(pairingCodeModal.connectionStatus)"
                >
                  <div class="status-dot"></div>
                  <span>{{
                    formatConnectionStatus(pairingCodeModal.connectionStatus)
                  }}</span>
                </div>
              </div>

              <!-- Pairing Code Section -->
              <div class="code-section">
                <div
                  v-if="pairingCodeModal.code && !pairingCodeModal.isConnecting"
                  class="code-container"
                >
                  <div class="code-display">
                    <span class="code-text">{{ pairingCodeModal.code }}</span>
                  </div>
                  <button class="copy-button" @click="copyPairingCode">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"
                      />
                    </svg>
                    Copy
                  </button>
                </div>

                <div v-else class="loading-state">
                  <div class="loading-animation">
                    <div class="loading-circle"></div>
                    <div class="loading-circle"></div>
                    <div class="loading-circle"></div>
                  </div>
                  <p class="loading-message">
                    {{
                      pairingCodeModal.code
                        ? "Waiting for pairing..."
                        : "Generating pairing code..."
                    }}
                  </p>
                </div>
              </div>

              <!-- Instructions -->
              <div
                v-if="pairingCodeModal.code && !pairingCodeModal.isConnecting"
                class="instructions-card"
              >
                <div class="instructions-header">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"
                    />
                  </svg>
                  How to Connect
                </div>
                <ol class="instruction-steps">
                  <li>Open <strong>WhatsApp</strong> on your phone</li>
                  <li>Go to <strong>Settings → Linked Devices</strong></li>
                  <li>Tap <strong>"Link a Device"</strong></li>
                  <li>
                    Select <strong>"Link with phone number instead"</strong>
                  </li>
                  <li>Enter the pairing code above</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useChannelStore } from "@/store/sessions";
import { useToast } from "@/composables/useToast";

const channelStore = useChannelStore();
const { qrCodeModal, pairingCodeModal } = storeToRefs(channelStore);
const { success, error } = useToast();

const headerStatusClass = computed(() => {
  if (qrCodeModal.value.showSuccess) return "status-success";
  if (qrCodeModal.value.isConnecting) return "status-connecting";
  return "status-ready";
});

const headerStatusClassPairing = computed(() => {
  if (pairingCodeModal.value.showSuccess) return "status-success";
  if (pairingCodeModal.value.isConnecting) return "status-connecting";
  return "status-ready";
});

const formatConnectionStatus = (status: string): string => {
  switch (status) {
    case "connecting":
      return "Connecting...";
    case "qr_ready":
      return "QR Code Ready";
    case "pairing_code_ready":
      return "Pairing Code Ready";
    case "unknown":
      return "Establishing Connection...";
    case "open":
      return "Connected";
    case "close":
      return "Disconnected";
    case "error":
      return "Connection Error";
    default:
      return status;
  }
};

const getStatusClass = (status: string): string => {
  switch (status) {
    case "connecting":
    case "unknown":
      return "status-connecting";
    case "qr_ready":
    case "pairing_code_ready":
      return "status-ready";
    case "open":
      return "status-connected";
    case "close":
    case "error":
      return "status-error";
    default:
      return "status-default";
  }
};

const copyPairingCode = async () => {
  if (pairingCodeModal.value.code) {
    try {
      await navigator.clipboard.writeText(pairingCodeModal.value.code);
      success("Pairing code copied to clipboard!", "Success");
    } catch (err) {
      console.error("Failed to copy pairing code:", err);
      error("Failed to copy pairing code to clipboard", "Error");
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease-out;
}

.modal-container {
  width: 90vw;
  max-width: 480px;
  max-height: 90vh;
  overflow: hidden;
}

.modal-content {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: modalSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition: all 0.3s ease;
}

.modal-content.success-mode {
  transform: scale(0.95);
}

/* Header */
.modal-header {
  padding: 24px 24px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.header-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
}

.status-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.status-icon.status-success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.status-icon.status-connecting {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.status-icon.status-ready {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
}

.header-text {
  flex: 1;
  min-width: 0;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.modal-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.channel-id {
  font-family: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.close-button {
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
  flex-shrink: 0;
}

.close-button:hover {
  background: #e5e7eb;
  color: #374151;
}

/* Body */
.modal-body {
  padding: 24px;
}

/* Success State */
.success-state {
  text-align: center;
  padding: 20px 0;
}

.celebration-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: bounce 2s infinite;
}

.success-state h3 {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}

.success-state p {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 24px 0;
}

.auto-close-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.progress-ring {
  position: relative;
}

.progress-circle {
  animation: progressRing 3s linear forwards;
}

.auto-close-text {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

/* Connection Status */
.connection-status {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.status-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.status-pill .status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.status-pill.status-connecting .status-dot {
  animation: pulse 2s infinite;
}

.status-pill.status-connecting {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.status-pill.status-ready {
  background: rgba(99, 102, 241, 0.1);
  color: #4f46e5;
}

.status-pill.status-connected {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.status-pill.status-error {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

/* QR Code Section */
.qr-section {
  margin-bottom: 24px;
}

.qr-container {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.qr-frame {
  position: relative;
  padding: 16px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border: 2px solid #f3f4f6;
}

.qr-frame img {
  display: block;
  width: 200px;
  height: 200px;
  border-radius: 8px;
}

.qr-corners {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  pointer-events: none;
}

.corner {
  position: absolute;
  width: 24px;
  height: 24px;
  border: 3px solid #3b82f6;
}

.corner-tl {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
  border-top-left-radius: 8px;
}

.corner-tr {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
  border-top-right-radius: 8px;
}

.corner-bl {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
  border-bottom-left-radius: 8px;
}

.corner-br {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
  border-bottom-right-radius: 8px;
}

/* Pairing Code Section */
.code-section {
  margin-bottom: 24px;
}

.code-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.code-display {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px 32px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.code-text {
  font-family: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  letter-spacing: 0.2em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.copy-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-button:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  min-height: 200px;
}

.loading-animation {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.loading-circle {
  width: 12px;
  height: 12px;
  background: #3b82f6;
  border-radius: 50%;
  animation: loadingBounce 1.4s infinite ease-in-out both;
}

.loading-circle:nth-child(1) {
  animation-delay: -0.32s;
}
.loading-circle:nth-child(2) {
  animation-delay: -0.16s;
}

.loading-message {
  font-size: 16px;
  color: #6b7280;
  font-weight: 500;
  margin: 0;
}

/* Instructions */
.instructions-card {
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border: 1px solid #bae6fd;
  border-radius: 12px;
  padding: 20px;
}

.instructions-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #0369a1;
  margin-bottom: 12px;
}

.instruction-steps {
  margin: 0;
  padding-left: 20px;
  color: #0c4a6e;
}

.instruction-steps li {
  margin-bottom: 6px;
  line-height: 1.5;
}

.instruction-steps strong {
  color: #0369a1;
  font-weight: 600;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translate(-50%, -60%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes bounce {
  0%,
  20%,
  53%,
  80%,
  100% {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translate3d(0, 0, 0);
  }
  40%,
  43% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -16px, 0);
  }
  70% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -8px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
}

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

@keyframes loadingBounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

@keyframes progressRing {
  from {
    stroke-dashoffset: 113;
  }
  to {
    stroke-dashoffset: 0;
  }
}

/* Responsive */
@media (max-width: 640px) {
  .modal-container {
    width: 95vw;
  }

  .modal-header {
    padding: 20px 20px 16px;
  }

  .modal-body {
    padding: 20px;
  }

  .header-content {
    gap: 12px;
  }

  .status-icon {
    width: 40px;
    height: 40px;
  }

  .modal-title {
    font-size: 18px;
  }

  .qr-frame img {
    width: 160px;
    height: 160px;
  }

  .code-text {
    font-size: 24px;
  }
}
</style>
