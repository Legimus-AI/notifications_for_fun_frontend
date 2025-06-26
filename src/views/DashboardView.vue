<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="h3">WhatsApp Channels</h2>
      <button class="btn btn-primary" @click="addNewChannel">
        <i class="bi bi-plus-circle"></i> Add New Channel
      </button>
    </div>

    <SessionList />
    <QRCodeModal />

    <!-- Toast Container for notifications -->
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import SessionList from "@/components/sessions/SessionList.vue";
import QRCodeModal from "@/components/sessions/QRCodeModal.vue";
import ToastContainer from "@/components/common/ToastContainer.vue";
import { useChannelStore } from "@/store/sessions";
import { useToast } from "@/composables/useToast";

const store = useChannelStore();
const { success, error } = useToast();

const addNewChannel = async () => {
  try {
    // Generate a default channel name - could be made more sophisticated
    const channelName = `WhatsApp Channel ${Date.now()}`;

    // This will trigger the whole process:
    // 1. Create Channel via API
    // 2. Connect Channel via API
    // 3. Show QR Modal and wait for WebSocket event
    await store.createAndConnectChannel(channelName);
  } catch (err: any) {
    // Show error message
    error(err.message || "Failed to create channel", "Error");
  }
};
</script>

<style scoped>
.d-flex {
  display: flex;
}
.justify-content-between {
  justify-content: space-between;
}
.align-items-center {
  align-items: center;
}
.mb-4 {
  margin-bottom: 1.5rem;
}
.h3 {
  font-size: 1.75rem;
  font-weight: 600;
}
.btn-primary {
  background-color: #0d6efd;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
}
</style>
