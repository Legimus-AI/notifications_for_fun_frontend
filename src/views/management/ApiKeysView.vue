<template>
  <div class="page-container">
    <PageHeader
      title="API Keys"
      subtitle="Create and manage API keys for programmatic access"
      :icon="['fas', 'key']"
      :breadcrumbs="[
        { label: 'Management', icon: ['fas', 'cog'], to: '/management' },
        { label: 'API Keys', icon: ['fas', 'key'] },
      ]"
    >
      <template #actions>
        <button
          class="btn btn-primary"
          @click="showCreateForm = !showCreateForm"
        >
          <i class="bi bi-plus-lg me-2"></i>Create API Key
        </button>
      </template>
    </PageHeader>

    <BCollapse v-model="showCreateForm" class="mb-4">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title mb-4">Create New API Key</h5>
          <form @submit.prevent="handleCreateApiKey">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="apiKeyName" class="form-label">API Key Name</label>
                <BFormInput
                  id="apiKeyName"
                  v-model="newApiKey.name"
                  type="text"
                  placeholder="My API Key"
                  required
                />
              </div>
            </div>
            <div class="row">
              <div class="col-12 mb-3">
                <label class="form-label">Permissions</label>
                <div class="d-flex flex-wrap gap-3">
                  <BFormCheckbox
                    v-model="newApiKey.permissions"
                    value="channel:manage"
                    >Channel Management</BFormCheckbox
                  >
                  <BFormCheckbox
                    v-model="newApiKey.permissions"
                    value="notification:send"
                    >Send Notifications</BFormCheckbox
                  >
                  <BFormCheckbox
                    v-model="newApiKey.permissions"
                    value="webhook:manage"
                    >Webhook Management</BFormCheckbox
                  >
                  <BFormCheckbox
                    v-model="newApiKey.permissions"
                    value="notification:read"
                    >Read Notifications</BFormCheckbox
                  >
                  <BFormCheckbox
                    v-model="newApiKey.permissions"
                    value="channel:read"
                    >Read Channels</BFormCheckbox
                  >
                </div>
              </div>
            </div>
            <div class="d-flex justify-content-end">
              <button type="submit" class="btn btn-dark" :disabled="loading">
                <span
                  v-if="loading"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                {{ loading ? "Creating..." : "Create API Key" }}
              </button>
            </div>
            <p v-if="error" class="text-danger mt-2 text-end">{{ error }}</p>
          </form>
        </div>
      </div>
    </BCollapse>

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div
            class="card-header d-flex justify-content-between align-items-center"
          >
            <h5 class="card-title mb-0">API Keys</h5>
          </div>
          <div v-if="loading && !apiKeys.length" class="card-body text-center">
            <div class="spinner-border" role="status"></div>
          </div>
          <div v-else-if="apiKeys.length === 0" class="card-body text-center">
            <p class="text-muted">No API keys created yet.</p>
          </div>
          <ul v-else class="list-group list-group-flush">
            <li
              v-for="apiKey in apiKeys"
              :key="apiKey._id"
              class="list-group-item d-flex justify-content-between align-items-center px-4 py-3"
            >
              <div>
                <h6 class="mb-0 fw-bold">{{ apiKey.name }}</h6>
                <small class="text-muted">
                  Key: {{ apiKey.key.substring(0, 20) }}... | Permissions:
                  {{ apiKey.permissions.join(", ") }} | Created:
                  {{ formatDate(apiKey.createdAt) }}
                </small>
              </div>
              <div class="d-flex align-items-center gap-3">
                <BFormCheckbox
                  switch
                  :checked="apiKey.isActive"
                  @change="toggleApiKey(apiKey._id, !apiKey.isActive)"
                />
                <button
                  class="btn btn-sm btn-outline-danger"
                  @click="deleteApiKey(apiKey._id)"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { useApiKeyStore } from "@/store/apiKeys";
import { storeToRefs } from "pinia";
import type { CreateApiKeyRequest } from "@/types/apiKeys";
import { API_PERMISSIONS } from "@/types/apiKeys";
import { BCollapse, BFormInput, BFormCheckbox } from "bootstrap-vue-3";
import PageHeader from "@/components/layout/PageHeader.vue";

// Store
const apiKeyStore = useApiKeyStore();

// Refs from stores
const { apiKeys, loading, error } = storeToRefs(apiKeyStore);

// Component state
const showCreateForm = ref(false);
const newApiKey = reactive<CreateApiKeyRequest>({
  name: "",
  permissions: ["channel:read"],
});

// Methods
const initialize = () => {
  apiKeyStore.fetchApiKeys();
};

const handleCreateApiKey = async () => {
  if (newApiKey.permissions.length === 0) {
    alert("Please select at least one permission.");
    return;
  }

  await apiKeyStore.createApiKey(newApiKey);
  if (!error.value) {
    Object.assign(newApiKey, {
      name: "",
      permissions: ["channel:read"],
    });
    showCreateForm.value = false;
  }
};

const toggleApiKey = async (id: string, isActive: boolean) => {
  await apiKeyStore.toggleApiKey(id, isActive);
};

const deleteApiKey = async (id: string) => {
  if (confirm("Are you sure you want to delete this API key?")) {
    await apiKeyStore.deleteApiKey(id);
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

onMounted(initialize);
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 3rem;
}

.btn-dark {
  background-color: #111827 !important;
  border-color: #111827 !important;
  color: white;
}
.btn-dark:hover {
  background-color: #374151 !important;
}
.list-group-item:last-child {
  border-bottom: none;
}
.card-header {
  background-color: #f9fafb;
}
</style>
