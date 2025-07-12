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

// Channel webhook interface based on MongoDB schema
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
