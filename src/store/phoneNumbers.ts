import { defineStore } from "pinia";
import api from "@/services/api";
import type { PhoneNumber } from "@/types/phoneNumbers";

interface Message {
  messageId: string;
  fromNumber: string;
  content: string;
  timestamp: string;
  type: string;
}

interface PhoneNumbersState {
  phoneNumbers: PhoneNumber[];
  messages: Message[];
  isLoadingPhoneNumbers: boolean;
  isLoadingMessages: boolean;
  phoneNumbersError: string | null;
  messagesError: string | null;
  selectedPhoneNumberId: string | null;
}

// Helper to map API response to frontend types
const mapPhoneNumber = (apiPhoneNumber: any): PhoneNumber => ({
  phone_number_id: apiPhoneNumber.phone_number_id,
  phone_number: apiPhoneNumber.phone_number,
  display_name: apiPhoneNumber.display_name,
  session_id: apiPhoneNumber.session_id,
});

const mapMessage = (apiMessage: any): Message => ({
  messageId: apiMessage.message_id,
  fromNumber: apiMessage.from_number,
  content: apiMessage.content,
  timestamp: apiMessage.timestamp,
  type: apiMessage.type,
});

export const usePhoneNumbersStore = defineStore("phoneNumbers", {
  state: (): PhoneNumbersState => ({
    phoneNumbers: [],
    messages: [],
    isLoadingPhoneNumbers: false,
    isLoadingMessages: false,
    phoneNumbersError: null,
    messagesError: null,
    selectedPhoneNumberId: null,
  }),
  actions: {
    async fetchPhoneNumbers() {
      this.isLoadingPhoneNumbers = true;
      this.phoneNumbersError = null;
      try {
        const response = await api.getConnectedPhoneNumbers();
        this.phoneNumbers = response.payload || [];
      } catch (e: any) {
        this.phoneNumbersError =
          e.response?.data?.message || "Failed to fetch phone numbers.";
      } finally {
        this.isLoadingPhoneNumbers = false;
      }
    },

    async fetchConnectedPhoneNumbers() {
      this.isLoadingPhoneNumbers = true;
      this.phoneNumbersError = null;
      try {
        const response = await api.getConnectedPhoneNumbers();
        this.phoneNumbers = response.payload || [];
      } catch (e: any) {
        this.phoneNumbersError =
          e.response?.data?.message ||
          "Failed to fetch connected phone numbers.";
      } finally {
        this.isLoadingPhoneNumbers = false;
      }
    },

    async fetchMessages(
      phoneNumberId: string,
      limit?: number,
      offset?: number
    ) {
      this.isLoadingMessages = true;
      this.messagesError = null;
      this.selectedPhoneNumberId = phoneNumberId; // Set selected ID
      try {
        const response = await api.getMessagesForPhoneNumber(
          phoneNumberId,
          limit,
          offset
        );
        this.messages = response.data.messages.map(mapMessage);
      } catch (e: any) {
        this.messagesError =
          e.response?.data?.message || "Failed to fetch messages.";
      } finally {
        this.isLoadingMessages = false;
      }
    },

    clearMessages() {
      this.messages = [];
      this.selectedPhoneNumberId = null;
    },
  },
});
