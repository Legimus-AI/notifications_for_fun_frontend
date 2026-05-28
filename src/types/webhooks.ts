// Webhook events accepted by notifications_for_fun backend.
// Kept in sync with models/Webhooks.ts on the backend side; the controller
// reads the same enum at runtime so this union is the UI mirror.
export type WebhookEvent =
  // Message lifecycle
  | "message.received"
  | "message.sent"
  | "message.delivered"
  | "message.read"
  | "message.status"
  // Call lifecycle
  | "call.received"
  // Channel lifecycle
  | "channel.status_update"
  | "channel.connected"
  | "channel.disconnected"
  | "channel.qr_ready"
  | "channel.pairing_code_ready"
  | "channel.error"
  | "channel.credentials_changed"
  // Notification lifecycle
  | "notification.sent"
  | "notification.delivered"
  | "notification.read"
  | "notification.failed"
  | "notification.received"
  // System
  | "system.health_check"
  | "api_key.rate_limit_exceeded";

// Webhook interfaces for embedded webhooks in channels
export interface ChannelWebhook {
  _id?: string;
  url: string;
  events: WebhookEvent[];
  isActive: boolean;
}

export interface CreateWebhookRequest {
  channelId: string;
  url: string;
  events: WebhookEvent[];
}

export interface UpdateWebhookRequest {
  url?: string;
  events?: WebhookEvent[];
  isActive?: boolean;
}

// Legacy interfaces for backward compatibility (can be removed later)
export interface Webhook {
  id: string;
  sessionId: string;
  webhook_url: string;
  webhook_secret?: string;
  events: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event: string;
  status_code: number;
  response_body?: string;
  delivered_at: string;
}
