<template>
  <div class="dashboard-container">
    <!-- Page Header -->
    <PageHeader
      title="Dashboard"
      subtitle="Manage your WhatsApp Business connections"
      :icon="['fas', 'table-columns']"
    >
      <template #stats>
        <StatCard
          :value="channels.length"
          label="Total Channels"
          :icon="['fas', 'comments']"
        />
        <StatCard
          :value="
            channels.filter((c) => c.status === 'active' || c.status === 'open')
              .length
          "
          label="Active Channels"
          :icon="['fas', 'circle']"
        />
      </template>
      <template #actions>
        <button class="btn btn-primary btn-lg" @click="addNewChannel">
          <i class="bi bi-plus-circle-fill"></i>
          Add New Channel
        </button>
      </template>
    </PageHeader>

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
import PageHeader from "@/components/layout/PageHeader.vue";
import StatCard from "@/components/common/StatCard.vue";
import { useChannelStore } from "@/store/sessions";
import { useToast } from "@/composables/useToast";
import { storeToRefs } from "pinia";

const store = useChannelStore();
const { success, error } = useToast();
const { channels } = storeToRefs(store);

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

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-content {
    padding: 1rem;
  }

  .btn-lg {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }
}
</style>
