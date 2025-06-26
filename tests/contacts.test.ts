import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useContactStore } from "@/store/contacts";
import api from "@/services/api";
import type {
  ContactCheckResponse,
  ContactStatus,
  ContactProfilePicture,
} from "@/types/contacts";

// Mock the API service
vi.mock("@/services/api", () => ({
  default: {
    checkContact: vi.fn(),
    getContactStatus: vi.fn(),
    getContactProfilePicture: vi.fn(),
  },
}));

describe("Contact Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe("phoneToJid helper", () => {
    it("should convert phone number to JID format", () => {
      const contactStore = useContactStore();

      expect(contactStore.phoneToJid("1234567890")).toBe(
        "1234567890@s.whatsapp.net"
      );
      expect(contactStore.phoneToJid("+1 (234) 567-8900")).toBe(
        "12345678900@s.whatsapp.net"
      );
      expect(contactStore.phoneToJid("1-234-567-8900")).toBe(
        "12345678900@s.whatsapp.net"
      );
    });
  });

  describe("jidToPhone helper", () => {
    it("should extract phone number from JID", () => {
      const contactStore = useContactStore();

      expect(contactStore.jidToPhone("1234567890@s.whatsapp.net")).toBe(
        "1234567890"
      );
      expect(contactStore.jidToPhone("12345678900@c.us")).toBe("12345678900");
    });
  });

  describe("checkContact action", () => {
    it("should successfully check a contact", async () => {
      const contactStore = useContactStore();
      const mockResponse: ContactCheckResponse = {
        exists: true,
        jid: "1234567890@s.whatsapp.net",
        name: "John Doe",
        isWhatsAppUser: true,
      };

      vi.mocked(api.checkContact).mockResolvedValueOnce({
        ok: true,
        payload: mockResponse,
        message: "",
      });

      const result = await contactStore.checkContact("channel-1", "1234567890");

      expect(result).toEqual(mockResponse);
      expect(contactStore.contacts).toHaveLength(1);
      expect(contactStore.contacts[0]).toMatchObject({
        jid: "1234567890@s.whatsapp.net",
        phoneNumber: "1234567890",
        exists: true,
        name: "John Doe",
        isWhatsAppUser: true,
      });
      expect(contactStore.searchHistory).toContain("1234567890");
    });

    it("should handle contact not found", async () => {
      const contactStore = useContactStore();
      const mockResponse: ContactCheckResponse = {
        exists: false,
        jid: "9999999999@s.whatsapp.net",
        isWhatsAppUser: false,
      };

      vi.mocked(api.checkContact).mockResolvedValueOnce({
        ok: true,
        payload: mockResponse,
        message: "",
      });

      const result = await contactStore.checkContact("channel-1", "9999999999");

      expect(result).toEqual(mockResponse);
      expect(contactStore.contacts[0].exists).toBe(false);
    });

    it("should handle API errors", async () => {
      const contactStore = useContactStore();

      vi.mocked(api.checkContact).mockRejectedValueOnce(
        new Error("Network error")
      );

      await expect(
        contactStore.checkContact("channel-1", "1234567890")
      ).rejects.toThrow("Network error");
      expect(contactStore.error).toBe("Network error");
    });

    it("should update existing contact", async () => {
      const contactStore = useContactStore();

      // Add initial contact
      contactStore.contacts.push({
        jid: "1234567890@s.whatsapp.net",
        phoneNumber: "1234567890",
        exists: true,
      });

      const mockResponse: ContactCheckResponse = {
        exists: true,
        jid: "1234567890@s.whatsapp.net",
        name: "Updated Name",
        isWhatsAppUser: true,
      };

      vi.mocked(api.checkContact).mockResolvedValueOnce({
        ok: true,
        payload: mockResponse,
        message: "",
      });

      await contactStore.checkContact("channel-1", "1234567890");

      expect(contactStore.contacts).toHaveLength(1);
      expect(contactStore.contacts[0].name).toBe("Updated Name");
      expect(contactStore.contacts[0].isWhatsAppUser).toBe(true);
    });
  });

  describe("getContactStatus action", () => {
    it("should successfully get contact status", async () => {
      const contactStore = useContactStore();

      // Add initial contact
      contactStore.contacts.push({
        jid: "1234567890@s.whatsapp.net",
        phoneNumber: "1234567890",
      });

      const mockResponse: ContactStatus = {
        jid: "1234567890@s.whatsapp.net",
        status: "Hey there! I am using WhatsApp.",
        lastSeen: "2024-01-01T10:00:00Z",
        isOnline: false,
      };

      vi.mocked(api.getContactStatus).mockResolvedValueOnce({
        ok: true,
        payload: mockResponse,
        message: "",
      });

      const result = await contactStore.getContactStatus(
        "channel-1",
        "1234567890@s.whatsapp.net"
      );

      expect(result).toEqual(mockResponse);
      expect(contactStore.contacts[0]).toMatchObject({
        status: "Hey there! I am using WhatsApp.",
        lastSeen: "2024-01-01T10:00:00Z",
        isOnline: false,
      });
    });
  });

  describe("getContactProfilePicture action", () => {
    it("should successfully get profile picture", async () => {
      const contactStore = useContactStore();

      // Add initial contact
      contactStore.contacts.push({
        jid: "1234567890@s.whatsapp.net",
        phoneNumber: "1234567890",
      });

      const mockResponse: ContactProfilePicture = {
        url: "https://example.com/profile.jpg",
        type: "image",
        jid: "1234567890@s.whatsapp.net",
      };

      vi.mocked(api.getContactProfilePicture).mockResolvedValueOnce({
        ok: true,
        payload: mockResponse,
        message: "",
      });

      const result = await contactStore.getContactProfilePicture(
        "channel-1",
        "1234567890@s.whatsapp.net"
      );

      expect(result).toEqual(mockResponse);
      expect(contactStore.contacts[0].profilePicture).toBe(
        "https://example.com/profile.jpg"
      );
    });
  });

  describe("search history management", () => {
    it("should add to search history and limit to 10 items", () => {
      const contactStore = useContactStore();

      // Add 12 items to history
      for (let i = 1; i <= 12; i++) {
        contactStore.searchHistory.push(`123456789${i}`);
      }

      expect(contactStore.recentSearches).toHaveLength(10);
      expect(contactStore.recentSearches[0]).toBe("1234567892"); // Most recent (reversed)
    });

    it("should remove item from search history", () => {
      const contactStore = useContactStore();

      contactStore.searchHistory.push("1234567890", "0987654321");
      contactStore.removeFromSearchHistory("1234567890");

      expect(contactStore.searchHistory).toEqual(["0987654321"]);
    });

    it("should clear search history", () => {
      const contactStore = useContactStore();

      contactStore.searchHistory.push("1234567890", "0987654321");
      contactStore.clearSearchHistory();

      expect(contactStore.searchHistory).toEqual([]);
    });
  });

  describe("state management", () => {
    it("should clear contacts", () => {
      const contactStore = useContactStore();

      contactStore.contacts.push({
        jid: "1234567890@s.whatsapp.net",
        phoneNumber: "1234567890",
      });
      contactStore.error = "Some error";

      contactStore.clearContacts();

      expect(contactStore.contacts).toEqual([]);
      expect(contactStore.error).toBeNull();
    });

    it("should find contact by JID", () => {
      const contactStore = useContactStore();

      const contact = {
        jid: "1234567890@s.whatsapp.net",
        phoneNumber: "1234567890",
        name: "John Doe",
      };

      contactStore.contacts.push(contact);

      const found = contactStore.getContactByJid("1234567890@s.whatsapp.net");
      expect(found).toEqual(contact);

      const notFound = contactStore.getContactByJid(
        "9999999999@s.whatsapp.net"
      );
      expect(notFound).toBeUndefined();
    });
  });
});
