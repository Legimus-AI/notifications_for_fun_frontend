export type ChannelStatus =
  | "inactive"
  | "connecting"
  | "connected"
  | "authenticated"
  | "qr_ready"
  | "pairing_code_ready"
  | "generating_qr"
  | "active"
  | "open"
  | "close"
  | "error"
  | "logged_out";

// Channel webhook interface — kept aligned with src/types/webhooks.ts.
// The standalone types/webhooks.ts is the source of truth for the event union
// and advanced fields. Imported here for use in WhatsAppChannel below, and
// re-exported so existing components that import from `@/types/sessions` keep
// working without changes.
import type { ChannelWebhook, WebhookEvent, WebhookMethod } from "./webhooks";
export type { ChannelWebhook, WebhookEvent, WebhookMethod };

export interface WhatsAppChannelConfig {
  phoneNumber?: string;
  connectedAt?: string;
}

export interface WhatsAppChannel {
  id: string;
  channelId: string;
  name: string;
  type: "whatsapp_automated";
  status: ChannelStatus;
  phoneNumber?: string; // Legacy field for backward compatibility
  lastActivity?: string;
  lastStatusUpdate?: string;
  isActive?: boolean;
  isConnecting?: boolean;
  connectionError?: string | null;
  webhooks?: ChannelWebhook[];
  config?: WhatsAppChannelConfig;
}

export interface CreateChannelRequest {
  name: string;
  phoneNumber?: string;
}

export interface ConnectChannelRequest {
  phoneNumber?: string;
}

export interface SendMessageRequest {
  to: string;
  message: string;
  type: "text";
}

export interface SendMediaRequest {
  to: string;
  mediaType: "image" | "video" | "audio" | "document";
  mediaUrl: string;
  caption?: string;
}

export interface PairingCodeRequest {
  phoneNumber: string;
}
