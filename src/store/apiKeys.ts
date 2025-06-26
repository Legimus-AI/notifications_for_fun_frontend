import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/services/api";
import type {
  ApiKey,
  CreateApiKeyRequest,
  UpdateApiKeyRequest,
} from "@/types/apiKeys";

export const useApiKeyStore = defineStore("apiKeys", () => {
  // State
  const apiKeys = ref<ApiKey[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Actions
  const fetchApiKeys = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.getApiKeys();
      if (response.ok && response.payload) {
        apiKeys.value = Array.isArray(response.payload) ? response.payload : [];
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || "Failed to fetch API keys";
    } finally {
      loading.value = false;
    }
  };

  const createApiKey = async (apiKeyData: CreateApiKeyRequest) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.createApiKey(apiKeyData);
      if (response.ok) {
        await fetchApiKeys(); // Refresh the list
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || "Failed to create API key";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateApiKey = async (id: string, updates: UpdateApiKeyRequest) => {
    loading.value = true;
    error.value = null;
    try {
      await api.updateApiKey(id, updates);
      await fetchApiKeys(); // Refresh the list
    } catch (e: any) {
      error.value = e.response?.data?.message || "Failed to update API key";
    } finally {
      loading.value = false;
    }
  };

  const toggleApiKey = async (id: string, isActive: boolean) => {
    loading.value = true;
    error.value = null;
    try {
      await api.toggleApiKey(id, isActive);
      await fetchApiKeys(); // Refresh the list
    } catch (e: any) {
      error.value = e.response?.data?.message || "Failed to toggle API key";
    } finally {
      loading.value = false;
    }
  };

  const deleteApiKey = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      await api.deleteApiKey(id);
      await fetchApiKeys(); // Refresh the list
    } catch (e: any) {
      error.value = e.response?.data?.message || "Failed to delete API key";
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    apiKeys,
    loading,
    error,
    // Actions
    fetchApiKeys,
    createApiKey,
    updateApiKey,
    toggleApiKey,
    deleteApiKey,
  };
});
