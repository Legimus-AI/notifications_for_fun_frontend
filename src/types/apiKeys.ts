export interface ApiKey {
  _id: string;
  key: string;
  name: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApiKeyRequest {
  name: string;
  permissions: string[];
}

export interface UpdateApiKeyRequest {
  name?: string;
  permissions?: string[];
  isActive?: boolean;
}

// Available permission constants
export const API_PERMISSIONS = [
  "channel:manage",
  "notification:send",
  "webhook:manage",
  "notification:read",
  "channel:read",
] as const;

export type ApiPermission = (typeof API_PERMISSIONS)[number];
