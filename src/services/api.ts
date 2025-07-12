import axios from "axios";
import { API_CONFIG } from "@/config";
import type {
  CreateWebhookRequest,
  Webhook,
  UpdateWebhookRequest,
} from "@/types/webhooks";
import type {
  CreateApiKeyRequest,
  ApiKey,
  UpdateApiKeyRequest,
} from "@/types/apiKeys";
import type {
  CreatePhoneNumberRequest,
  PhoneNumber,
  UpdatePhoneNumberRequest,
} from "@/types/phoneNumbers";
import type {
  WhatsAppChannel,
  CreateChannelRequest,
  ConnectChannelRequest,
  SendMessageRequest,
  SendMediaRequest,
  PairingCodeRequest,
} from "@/types/sessions";
import type {
  ContactCheckResponse,
  ContactStatus,
  ContactProfilePicture,
} from "@/types/contacts";
import type { PaginatedResponse } from "@/types/pagination";
import type {
  WhatsAppEvent,
  WhatsAppEventsResponse,
} from "@/types/whatsappEvents";

// Generic API response type
interface ApiResponse<T> {
  ok: boolean;
  payload?: T;
  message?: string;
  error?: string;
}

const apiClient = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/api`,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor to unwrap data
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

export default {
  // WhatsApp Channel Management
  createChannel(
    data: CreateChannelRequest
  ): Promise<ApiResponse<WhatsAppChannel>> {
    return apiClient.post("/whatsapp/channels", data);
  },
  getAllChannels(): Promise<ApiResponse<WhatsAppChannel[]>> {
    return apiClient.get("/whatsapp/channels");
  },
  getChannelStatus(channelId: string): Promise<ApiResponse<WhatsAppChannel>> {
    return apiClient.get(`/whatsapp/channels/${channelId}/status`);
  },
  connectChannel(
    channelId: string,
    data?: ConnectChannelRequest
  ): Promise<
    ApiResponse<{ channelId: string; status: string; message: string }>
  > {
    return apiClient.post(
      `/whatsapp/channels/${channelId}/connect`,
      data || {}
    );
  },
  disconnectChannel(channelId: string): Promise<ApiResponse<void>> {
    return apiClient.post(`/whatsapp/channels/${channelId}/disconnect`);
  },
  deleteChannel(channelId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/whatsapp/channels/${channelId}`);
  },
  requestPairingCode(
    channelId: string,
    data: PairingCodeRequest
  ): Promise<ApiResponse<{ code: string }>> {
    return apiClient.post(`/whatsapp/channels/${channelId}/pairing-code`, data);
  },
  refreshQrCode(channelId: string): Promise<
    ApiResponse<{
      channelId: string;
      status: string;
      message: string;
    }>
  > {
    return apiClient.post(`/whatsapp/channels/${channelId}/qr/refresh`);
  },
  sendMessage(
    channelId: string,
    data: SendMessageRequest
  ): Promise<
    ApiResponse<{ messageId: string; to: string; type: string; status: string }>
  > {
    return apiClient.post(`/whatsapp/channels/${channelId}/send`, data);
  },
  sendMedia(
    channelId: string,
    data: SendMediaRequest
  ): Promise<
    ApiResponse<{ messageId: string; to: string; type: string; status: string }>
  > {
    return apiClient.post(`/whatsapp/channels/${channelId}/send-media`, data);
  },

  // Channel Webhook Management
  addWebhookToChannel(
    channelId: string,
    data: { url: string; events: string[] }
  ): Promise<ApiResponse<void>> {
    return apiClient.post(`/whatsapp/channels/${channelId}/webhooks`, data);
  },
  updateChannelWebhook(
    channelId: string,
    webhookId: string,
    data: { url?: string; events?: string[]; isActive?: boolean }
  ): Promise<ApiResponse<void>> {
    return apiClient.put(
      `/whatsapp/channels/${channelId}/webhooks/${webhookId}`,
      data
    );
  },
  deleteChannelWebhook(
    channelId: string,
    webhookId: string
  ): Promise<ApiResponse<void>> {
    return apiClient.delete(
      `/whatsapp/channels/${channelId}/webhooks/${webhookId}`
    );
  },

  // Legacy Webhook Management (for backward compatibility)
  getWebhooks: (): Promise<ApiResponse<Webhook[]>> =>
    apiClient.get("/management/webhooks"),
  setWebhook: (data: CreateWebhookRequest): Promise<ApiResponse<Webhook>> =>
    apiClient.post("/management/webhooks", {
      channelId: data.channelId,
      url: data.url,
      events: data.events,
    }),
  updateWebhook: (
    sessionId: string,
    data: UpdateWebhookRequest
  ): Promise<ApiResponse<void>> =>
    apiClient.put(`/management/webhooks/${sessionId}`, data),
  deleteWebhook: (sessionId: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/management/webhooks/${sessionId}`),
  toggleWebhook: (
    sessionId: string,
    isActive: boolean
  ): Promise<ApiResponse<void>> =>
    apiClient.put(`/management/webhooks/${sessionId}/status`, {
      is_active: isActive,
    }),

  // Phone Number Management
  getPhoneNumbers: (): Promise<ApiResponse<PhoneNumber[]>> =>
    apiClient.get("/management/phone-numbers"),
  getConnectedPhoneNumbers: (): Promise<ApiResponse<PhoneNumber[]>> =>
    apiClient.get("/management/phone-numbers/connected"),
  getMessagesForPhoneNumber(
    phoneNumberId: string,
    limit?: number,
    offset?: number
  ) {
    return apiClient.get(`/management/messages/${phoneNumberId}`, {
      params: { limit, offset },
    });
  },
  createPhoneNumber: (
    data: CreatePhoneNumberRequest
  ): Promise<ApiResponse<PhoneNumber>> =>
    apiClient.post("/management/phone-numbers", data),

  // API Key Management
  getApiKeys: (): Promise<ApiResponse<ApiKey[]>> => apiClient.get("/api_keys"),
  createApiKey: (data: CreateApiKeyRequest): Promise<ApiResponse<ApiKey>> =>
    apiClient.post("/api_keys", data),
  updateApiKey: (
    id: string,
    data: UpdateApiKeyRequest
  ): Promise<ApiResponse<void>> => apiClient.put(`/api_keys/${id}`, data),
  deleteApiKey: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/api_keys/${id}`),
  toggleApiKey: (id: string, isActive: boolean): Promise<ApiResponse<void>> =>
    apiClient.put(`/api_keys/${id}`, { isActive }),

  // Contact Management
  checkContact(
    channelId: string,
    jid: string
  ): Promise<ApiResponse<ContactCheckResponse>> {
    return apiClient.get(
      `/whatsapp/channels/${channelId}/contacts/${jid}/check`
    );
  },
  getContactStatus(
    channelId: string,
    jid: string
  ): Promise<ApiResponse<ContactStatus>> {
    return apiClient.get(
      `/whatsapp/channels/${channelId}/contacts/${jid}/status`
    );
  },
  getContactProfilePicture(
    channelId: string,
    jid: string
  ): Promise<ApiResponse<ContactProfilePicture>> {
    return apiClient.get(
      `/whatsapp/channels/${channelId}/contacts/${jid}/photo`
    );
  },

  // WhatsApp Events
  getWhatsAppEvents(params: {
    channelId: string;
    sort?: string;
    order?: string;
    page?: number;
    limit?: number;
  }): Promise<WhatsAppEventsResponse> {
    return apiClient.get("/whatsapp_events", { params });
  },

  // General API Endpoints
  getApiStatus() {
    return apiClient.get("/status");
  },
};
