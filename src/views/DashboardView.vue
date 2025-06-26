<template>
  <div class="dashboard-container">
    <!-- Page Header -->
    <header class="page-header">
      <div class="page-header__content">
        <div class="page-title-section">
          <h1 class="page-title">WhatsApp Channels</h1>
          <p class="page-subtitle">Manage your WhatsApp Business connections</p>
        </div>
        <button class="btn btn-primary btn-lg" @click="addNewChannel">
          <i class="bi bi-plus-circle-fill"></i>
          Add New Channel
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="dashboard-content">
      <SessionList />
      <QRCodeModal />

      <!-- Toast Container for notifications -->
      <ToastContainer />
    </main>
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

    // Show success message
    success("Channel creation initiated successfully!", "Success");
  } catch (err: any) {
    // Show error message
    error(err.message || "Failed to create channel", "Error");
  }
};
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: var(--color-background);
}

.page-header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(8px);
}

.page-header__content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
}

.page-title-section {
  flex: 1;
  min-width: 0;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.025em;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin: var(--spacing-xs) 0 0 0;
  line-height: 1.5;
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-lg);
}

/* Enhanced button styling */
.btn {
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s;
}

.btn:hover::before {
  left: 100%;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-header__content {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
  }

  .page-title {
    font-size: 1.75rem;
  }

  .page-subtitle {
    font-size: 0.875rem;
  }

  .dashboard-content {
    padding: var(--spacing-lg);
  }
}

@media (max-width: 480px) {
  .page-header__content {
    padding: var(--spacing-md);
  }

  .page-title {
    font-size: 1.5rem;
  }

  .dashboard-content {
    padding: var(--spacing-md);
  }
}
</style>
