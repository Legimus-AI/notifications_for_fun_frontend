// Updated webhook interfaces for embedded webhooks in channels
export interface ChannelWebhook {
  _id?: string;
  url: string;
  events: (
    | "message.received"
    | "message.sent"
    | "message.delivered"
    | "message.read"
  )[];
  isActive: boolean;
}

export interface CreateWebhookRequest {
  channelId: string;
  url: string;
  events: (
    | "message.received"
    | "message.sent"
    | "message.delivered"
    | "message.read"
  )[];
}

export interface UpdateWebhookRequest {
  url?: string;
  events?: (
    | "message.received"
    | "message.sent"
    | "message.delivered"
    | "message.read"
  )[];
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
