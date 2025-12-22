export type TelegramChannelStatus =
  | "inactive"
  | "connecting"
  | "connected"
  | "authenticated"
  | "logged_out"
  | "error"
  | "active";

export interface TelegramChannel {
  id: string;
  channelId: string;
  name: string;
  apiId: number;
  apiHash: string;
  phoneNumber: string;
  password2FA?: string;
  status: TelegramChannelStatus;
  isActive?: boolean;
  lastActivity?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTelegramChannelRequest {
  name: string;
  apiId: number;
  apiHash: string;
  phoneNumber: string;
  password2FA?: string;
}

export interface UpdateTelegramChannelRequest {
  name?: string;
  apiId?: number;
  apiHash?: string;
  phoneNumber?: string;
  password2FA?: string;
}

export interface VerifyLoginRequest {
  phoneCode: string;
  password?: string;
}

export interface SendMessageRequest {
  recipient: string;
  text: string;
}

export interface SendAlertRequest {
  recipient: string;
  message?: string;
  soundFile?: string;
  duration?: number;
}

export interface MakeCallRequest {
  recipient: string;
  wakeUpMessage?: string;
  ttsText?: string;
  ttsVoice?: string;
}

export interface TelegramChannelStatusResponse {
  channelId: string;
  status: TelegramChannelStatus;
  phoneNumber?: string;
  isAuthenticated: boolean;
  lastActivity?: string;
}
