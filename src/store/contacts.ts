import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/services/api";
import type {
  Contact,
  ContactCheckResponse,
  ContactStatus,
  ContactProfilePicture,
} from "@/types/contacts";

export const useContactStore = defineStore("contacts", () => {
  // State
  const contacts = ref<Contact[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const searchHistory = ref<string[]>([]);

  // Getters
  const getContactByJid = computed(() => {
    return (jid: string) =>
      contacts.value.find((contact) => contact.jid === jid);
  });

  const recentSearches = computed(() => {
    return searchHistory.value.slice(-10).reverse();
  });

  // Helper function to convert phone number to JID format
  const phoneToJid = (phoneNumber: string): string => {
    // Remove any non-digit characters and add @s.whatsapp.net
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    return `${cleanNumber}@s.whatsapp.net`;
  };

  // Helper function to extract phone number from JID
  const jidToPhone = (jid: string): string => {
    return jid.split("@")[0];
  };

  // Actions
  const checkContact = async (
    channelId: string,
    phoneNumber: string
  ): Promise<ContactCheckResponse> => {
    loading.value = true;
    error.value = null;

    try {
      const jid = phoneToJid(phoneNumber);
      const response = await api.checkContact(channelId, jid);

      if (response.ok && response.payload) {
        // Update or add contact to our store
        const existingContactIndex = contacts.value.findIndex(
          (c) => c.jid === jid
        );
        const contactData: Contact = {
          jid,
          phoneNumber,
          exists: response.payload.exists,
          name: response.payload.name,
          isWhatsAppUser: response.payload.isWhatsAppUser,
        };

        if (existingContactIndex >= 0) {
          contacts.value[existingContactIndex] = {
            ...contacts.value[existingContactIndex],
            ...contactData,
          };
        } else {
          contacts.value.push(contactData);
        }

        // Add to search history
        if (!searchHistory.value.includes(phoneNumber)) {
          searchHistory.value.push(phoneNumber);
        }

        return response.payload;
      }

      throw new Error(response.message || "Failed to check contact");
    } catch (e: any) {
      error.value =
        e.response?.data?.message || e.message || "Failed to check contact";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const getContactStatus = async (
    channelId: string,
    jid: string
  ): Promise<ContactStatus> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.getContactStatus(channelId, jid);

      if (response.ok && response.payload) {
        // Update contact in store
        const existingContactIndex = contacts.value.findIndex(
          (c) => c.jid === jid
        );
        if (existingContactIndex >= 0) {
          contacts.value[existingContactIndex] = {
            ...contacts.value[existingContactIndex],
            status: response.payload.status,
            lastSeen: response.payload.lastSeen,
            isOnline: response.payload.isOnline,
          };
        }

        return response.payload;
      }

      throw new Error(response.message || "Failed to get contact status");
    } catch (e: any) {
      error.value =
        e.response?.data?.message ||
        e.message ||
        "Failed to get contact status";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const getContactProfilePicture = async (
    channelId: string,
    jid: string
  ): Promise<ContactProfilePicture> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.getContactProfilePicture(channelId, jid);

      if (response.ok && response.payload) {
        // Update contact in store
        const existingContactIndex = contacts.value.findIndex(
          (c) => c.jid === jid
        );
        if (existingContactIndex >= 0) {
          contacts.value[existingContactIndex] = {
            ...contacts.value[existingContactIndex],
            profilePicture: response.payload.url,
          };
        }

        return response.payload;
      }

      throw new Error(response.message || "Failed to get profile picture");
    } catch (e: any) {
      error.value =
        e.response?.data?.message ||
        e.message ||
        "Failed to get profile picture";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const clearContacts = () => {
    contacts.value = [];
    error.value = null;
  };

  const clearSearchHistory = () => {
    searchHistory.value = [];
  };

  const removeFromSearchHistory = (phoneNumber: string) => {
    const index = searchHistory.value.indexOf(phoneNumber);
    if (index > -1) {
      searchHistory.value.splice(index, 1);
    }
  };

  return {
    // State
    contacts,
    loading,
    error,
    searchHistory,

    // Getters
    getContactByJid,
    recentSearches,

    // Helper functions
    phoneToJid,
    jidToPhone,

    // Actions
    checkContact,
    getContactStatus,
    getContactProfilePicture,
    clearContacts,
    clearSearchHistory,
    removeFromSearchHistory,
  };
});
