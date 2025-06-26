import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/services/api";
import type {
  Webhook,
  CreateWebhookRequest,
  UpdateWebhookRequest,
} from "@/types/webhooks";

export const useWebhookStore = defineStore("webhooks", () => {
  // State
  const webhooks = ref<Webhook[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Actions
  const fetchWebhooks = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.getWebhooks();
      webhooks.value = response.data || [];
    } catch (e: any) {
      error.value = e.response?.data?.message || "Failed to fetch webhooks";
    } finally {
      loading.value = false;
    }
  };

  const setWebhook = async (webhookData: CreateWebhookRequest) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.setWebhook(webhookData);
      if (response.success) {
        await fetchWebhooks(); // Refresh the list
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || "Failed to create webhook";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateWebhook = async (
    sessionId: string,
    updates: UpdateWebhookRequest
  ) => {
    loading.value = true;
    error.value = null;
    try {
      await api.updateWebhook(sessionId, updates);
      await fetchWebhooks(); // Refresh the list
    } catch (e: any) {
      error.value = e.response?.data?.message || "Failed to update webhook";
    } finally {
      loading.value = false;
    }
  };

  const toggleWebhook = async (sessionId: string, isActive: boolean) => {
    loading.value = true;
    error.value = null;
    try {
      await api.toggleWebhook(sessionId, isActive);
      await fetchWebhooks(); // Refresh the list
    } catch (e: any) {
      error.value = e.response?.data?.message || "Failed to toggle webhook";
    } finally {
      loading.value = false;
    }
  };

  const deleteWebhook = async (sessionId: string) => {
    loading.value = true;
    error.value = null;
    try {
      await api.deleteWebhook(sessionId);
      await fetchWebhooks(); // Refresh the list
    } catch (e: any) {
      error.value = e.response?.data?.message || "Failed to delete webhook";
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    webhooks,
    loading,
    error,
    // Actions
    fetchWebhooks,
    setWebhook,
    updateWebhook,
    toggleWebhook,
    deleteWebhook,
  };
});
