export interface ContactCheckResponse {
  exists: boolean;
  jid: string;
  name?: string;
  isWhatsAppUser?: boolean;
}

export interface ContactStatus {
  jid: string;
  status?: string;
  lastSeen?: string;
  isOnline?: boolean;
}

export interface ContactProfilePicture {
  url: string;
  type: "image" | "preview";
  jid: string;
}

export interface Contact {
  jid: string;
  name?: string;
  phoneNumber?: string;
  profilePicture?: string;
  status?: string;
  lastSeen?: string;
  isOnline?: boolean;
  exists?: boolean;
  isWhatsAppUser?: boolean;
}

export interface ContactSearchRequest {
  phoneNumber: string;
  countryCode?: string;
}
