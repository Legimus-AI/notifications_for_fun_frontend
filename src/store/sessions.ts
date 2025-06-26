import { defineStore } from "pinia";
import { v4 as uuidv4 } from "uuid";
import type { WhatsAppChannel } from "../types/sessions";
import api from "@/services/api";
import socket from "@/services/websocket";

interface ChannelState {
  channels: WhatsAppChannel[];
  isLoading: boolean;
  error: string | null;
  qrCodeModal: {
    isOpen: boolean;
    qrCode: string;
    channelId: string;
    isConnecting: boolean;
    connectionStatus: string | null;
    showSuccess: boolean;
  };
  pairingCodeModal: {
    isOpen: boolean;
    code: string;
    channelId: string;
    isConnecting: boolean;
    connectionStatus: string | null;
    showSuccess: boolean;
  };
}

// Helper to map API response to frontend type
const mapChannel = (apiChannel: any): WhatsAppChannel => ({
  id: apiChannel.channelId,
  channelId: apiChannel.channelId,
  name: apiChannel.name,
  type: apiChannel.type,
  status: apiChannel.status,
  phoneNumber: apiChannel.phoneNumber,
  lastActivity: apiChannel.lastStatusUpdate,
  lastStatusUpdate: apiChannel.lastStatusUpdate,
  isActive: apiChannel.isActive,
  isConnecting: false,
  connectionError: null,
  webhooks: apiChannel.webhooks || [],
});

export const useChannelStore = defineStore("channels", {
  state: (): ChannelState => ({
    channels: [],
    isLoading: false,
    error: null,
    qrCodeModal: {
      isOpen: false,
      qrCode: "",
      channelId: "",
      isConnecting: false,
      connectionStatus: null,
      showSuccess: false,
    },
    pairingCodeModal: {
      isOpen: false,
      code: "",
      channelId: "",
      isConnecting: false,
      connectionStatus: null,
      showSuccess: false,
    },
  }),
  actions: {
    async fetchChannels() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.getAllChannels();
        if (response.ok && response.payload) {
          this.channels = Array.isArray(response.payload)
            ? response.payload.map(mapChannel)
            : [];
        }
      } catch (e: any) {
        const errorMessage =
          e.response?.data?.message || "Failed to fetch channels.";
        this.error = errorMessage;
        throw new Error(errorMessage);
      } finally {
        this.isLoading = false;
      }
    },
    async createAndConnectChannel(name: string, phoneNumber?: string) {
      this.error = null; // Clear any previous errors
      try {
        // Create channel
        const createResponse = await api.createChannel({ name, phoneNumber });
        if (!createResponse.ok || !createResponse.payload) {
          throw new Error("Failed to create channel");
        }

        const channel = mapChannel(createResponse.payload);
        this.channels.push(channel);
        console.log("📝 Channel created:", channel);

        // Ensure socket is connected before subscribing
        if (socket.connected) {
          console.log(
            "📺 Socket is connected, subscribing immediately to:",
            channel.channelId
          );
          this.subscribeToChannel(channel.channelId);
        } else {
          console.log(
            "⏳ Socket not connected, will subscribe after connection for:",
            channel.channelId
          );
          // Ensure socket is connecting
          if (!socket.connected) {
            socket.connect();
          }
          socket.once("connect", () => {
            console.log(
              "📺 Socket connected, now subscribing to new channel:",
              channel.channelId
            );
            this.subscribeToChannel(channel.channelId);
          });
        }

        // Connect channel (don't let connection errors affect channel creation)
        try {
          await this.connectChannel(channel.channelId, phoneNumber);
        } catch (connectError) {
          // Channel was created successfully, but connection failed
          console.warn("Channel created but connection failed:", connectError);
          // The connection error will be handled by connectChannel itself
        }
      } catch (e: any) {
        const errorMessage =
          e.response?.data?.message || e.message || `Failed to create channel.`;
        this.error = errorMessage;
        throw new Error(errorMessage);
      }
    },
    async connectChannel(channelId: string, phoneNumber?: string) {
      // Don't open modal immediately - wait for QR code event
      // Just update channel status to connecting
      const channel = this.channels.find((c) => c.channelId === channelId);
      if (channel) {
        channel.isConnecting = true;
        channel.connectionError = null;
        channel.status = "connecting";
      }

      try {
        await api.connectChannel(
          channelId,
          phoneNumber ? { phoneNumber } : undefined
        );
        console.log(`🔄 Connection initiated for channel: ${channelId}`);
      } catch (e: any) {
        const channel = this.channels.find((c) => c.channelId === channelId);
        if (channel) {
          channel.connectionError = `Failed to connect channel ${channelId}.`;
          channel.isConnecting = false;
          channel.status = "error";
        }
        console.error(`❌ Connection failed for channel: ${channelId}`, e);
      }
    },
    async disconnectChannel(channelId: string) {
      try {
        await api.disconnectChannel(channelId);
        this.fetchChannels();
      } catch (e: any) {
        const errorMessage =
          e.response?.data?.message ||
          `Failed to disconnect channel ${channelId}.`;
        this.error = errorMessage;
        throw new Error(errorMessage);
      }
    },
    async deleteChannel(channelId: string) {
      try {
        await api.deleteChannel(channelId);
        this.fetchChannels();
      } catch (e: any) {
        const errorMessage =
          e.response?.data?.message || `Failed to delete channel ${channelId}.`;
        this.error = errorMessage;
        throw new Error(errorMessage);
      }
    },
    async requestPairingCode(channelId: string, phoneNumber: string) {
      try {
        const response = await api.requestPairingCode(channelId, {
          phoneNumber,
        });
        if (response.ok && response.payload?.code) {
          this.showPairingCode(channelId, response.payload.code);
        }
      } catch (e: any) {
        const errorMessage =
          e.response?.data?.message || `Failed to request pairing code.`;
        this.error = errorMessage;
        throw new Error(errorMessage);
      }
    },
    showQrCode(channelId: string, qrCode: string) {
      // If modal is already open for a different channel, close it first
      if (this.qrCodeModal.isOpen && this.qrCodeModal.channelId !== channelId) {
        this.hideQrCode();
      }

      // Update QR code data (this handles both new channels and QR updates for same channel)
      this.qrCodeModal.channelId = channelId;
      this.qrCodeModal.qrCode = qrCode;
      this.qrCodeModal.isOpen = true;
      this.qrCodeModal.isConnecting = false; // QR is ready, not connecting anymore
      this.qrCodeModal.connectionStatus = "qr_ready";
      this.qrCodeModal.showSuccess = false;

      console.log(`📱 QR Code modal opened for channel: ${channelId}`);
    },
    hideQrCode() {
      this.qrCodeModal.isOpen = false;
      this.qrCodeModal.qrCode = "";
      this.qrCodeModal.isConnecting = false;
      this.qrCodeModal.connectionStatus = null;
      this.qrCodeModal.showSuccess = false;
    },
    showPairingCode(channelId: string, code: string) {
      // If modal is already open for a different channel, close it first
      if (
        this.pairingCodeModal.isOpen &&
        this.pairingCodeModal.channelId !== channelId
      ) {
        this.hidePairingCode();
      }

      this.pairingCodeModal.channelId = channelId;
      this.pairingCodeModal.code = code;
      this.pairingCodeModal.isOpen = true;
      this.pairingCodeModal.isConnecting = false; // Code is ready, not connecting anymore
      this.pairingCodeModal.connectionStatus = "pairing_code_ready";
      this.pairingCodeModal.showSuccess = false;

      console.log(`🔢 Pairing code modal opened for channel: ${channelId}`);
    },
    hidePairingCode() {
      this.pairingCodeModal.isOpen = false;
      this.pairingCodeModal.code = "";
      this.pairingCodeModal.isConnecting = false;
      this.pairingCodeModal.connectionStatus = null;
      this.pairingCodeModal.showSuccess = false;
    },
    listenToEvents() {
      console.log("🎧 Setting up event listeners...");
      console.log("🔌 Socket connection status:", socket.connected);

      if (!socket.connected) {
        console.log("🔌 Connecting to Socket.io server...");
        socket.connect();
      } else {
        console.log("🔌 Socket already connected");
      }

      // Remove previous listeners to avoid duplicates
      socket.off("connect");
      socket.off("disconnect");
      socket.off("qr_code");
      socket.off("pairing_code");
      socket.off("connection_update");
      socket.off("incoming_message");
      socket.off("message_status_update");
      socket.off("channel_status");

      // Listen for socket connection events
      socket.on("connect", () => {
        console.log("✅ Socket.io connected successfully!");
        // Subscribe to all existing channels when socket connects
        this.subscribeToAllChannels();
      });

      socket.on("disconnect", (reason) => {
        console.log("❌ Socket.io disconnected:", reason);
      });

      // Listen for QR codes
      socket.on(
        "qr_code",
        (data: { channelId: string; qrCode: string; timestamp: string }) => {
          console.log("📱 QR Code received:", data);
          // Always show QR code when received, even if modal is already open
          // This handles QR code updates for the same channel
          this.showQrCode(data.channelId, data.qrCode);

          // Update channel status
          const channel = this.channels.find(
            (c) => c.channelId === data.channelId
          );
          if (channel) {
            channel.status = "qr_ready";
            channel.isConnecting = false;
            channel.connectionError = null;
          }
        }
      );

      // Listen for pairing codes
      socket.on(
        "pairing_code",
        (data: { channelId: string; code: string; timestamp: string }) => {
          console.log("🔢 Pairing code received:", data);
          this.showPairingCode(data.channelId, data.code);

          // Update channel status
          const channel = this.channels.find(
            (c) => c.channelId === data.channelId
          );
          if (channel) {
            channel.status = "pairing_code_ready";
            channel.isConnecting = false;
            channel.connectionError = null;
          }
        }
      );

      // Listen for channel status updates
      socket.on(
        "channel_status",
        (data: { channelId: string; status: string }) => {
          console.log("📊 Channel status received:", data);
          const channel = this.channels.find(
            (c) => c.channelId === data.channelId
          );
          if (channel) {
            channel.status = data.status as any;
            // Update UI accordingly
            if (data.status === "active" || data.status === "open") {
              channel.isActive = true;
              channel.isConnecting = false;
              channel.connectionError = null;
            } else if (data.status === "inactive" || data.status === "close") {
              channel.isActive = false;
              channel.isConnecting = false;
            }
          }
        }
      );

      // Listen for connection status updates
      socket.on(
        "connection_update",
        (data: {
          channelId: string;
          status: string;
          timestamp: string;
          lastDisconnect?: {
            reason: number;
            message: string;
          };
        }) => {
          console.log("🔄 Connection status update:", data);
          const channel = this.channels.find(
            (c) => c.channelId === data.channelId
          );

          // Update modal states if this is the active channel
          if (
            this.qrCodeModal.isOpen &&
            this.qrCodeModal.channelId === data.channelId
          ) {
            this.qrCodeModal.connectionStatus = data.status;

            if (data.status === "open") {
              this.qrCodeModal.isConnecting = false;
              this.qrCodeModal.showSuccess = true;
              // Auto-minimize modal after showing success for 3 seconds
              setTimeout(() => {
                this.hideQrCode();
              }, 3000);
            } else if (data.status === "close" || data.status === "error") {
              this.qrCodeModal.isConnecting = false;
              this.qrCodeModal.showSuccess = false;
            } else if (data.status === "connecting") {
              this.qrCodeModal.isConnecting = true;
              this.qrCodeModal.showSuccess = false;
            }
          }

          if (
            this.pairingCodeModal.isOpen &&
            this.pairingCodeModal.channelId === data.channelId
          ) {
            this.pairingCodeModal.connectionStatus = data.status;

            if (data.status === "open") {
              this.pairingCodeModal.isConnecting = false;
              this.pairingCodeModal.showSuccess = true;
              // Auto-minimize modal after showing success for 3 seconds
              setTimeout(() => {
                this.hidePairingCode();
              }, 3000);
            } else if (data.status === "close" || data.status === "error") {
              this.pairingCodeModal.isConnecting = false;
              this.pairingCodeModal.showSuccess = false;
            } else if (data.status === "connecting") {
              this.pairingCodeModal.isConnecting = true;
              this.pairingCodeModal.showSuccess = false;
            }
          }

          if (channel) {
            channel.status = data.status as any;
            channel.lastStatusUpdate = data.timestamp;

            if (data.status === "open") {
              channel.isActive = true;
              channel.isConnecting = false;
              channel.connectionError = null;
              this.fetchChannels(); // Refresh to get latest data
            } else if (data.status === "close" || data.status === "error") {
              channel.isActive = false;
              channel.isConnecting = false;
              if (data.lastDisconnect) {
                channel.connectionError = `Connection failed: ${data.lastDisconnect.message}`;
              }
            } else if (data.status === "connecting") {
              channel.isConnecting = true;
              channel.connectionError = null;
            }
          }
        }
      );

      // Listen for incoming messages
      socket.on(
        "incoming_message",
        (data: {
          channelId: string;
          messageId: string;
          from: string;
          timestamp: string;
          message: string;
          type: "incoming";
        }) => {
          console.log("Incoming message:", data);
          // Handle incoming messages if needed
        }
      );

      // Listen for message status updates
      socket.on(
        "message_status_update",
        (data: {
          channelId: string;
          messageId: string;
          status: string;
          timestamp: string;
        }) => {
          console.log("Message status update:", data);
          // Handle message status updates if needed
        }
      );
    },

    // Webhook management methods
    async addWebhookToChannel(
      channelId: string,
      webhookData: { url: string; events: string[] }
    ) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.addWebhookToChannel(channelId, webhookData);
        if (response.ok) {
          // Refresh channels to get updated webhook data
          await this.fetchChannels();
        }
      } catch (e: any) {
        this.error = e.response?.data?.message || "Failed to add webhook";
        throw e;
      } finally {
        this.isLoading = false;
      }
    },

    async updateChannelWebhook(
      channelId: string,
      webhookId: string,
      updates: { url?: string; events?: string[]; isActive?: boolean }
    ) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.updateChannelWebhook(
          channelId,
          webhookId,
          updates
        );
        if (response.ok) {
          // Refresh channels to get updated webhook data
          await this.fetchChannels();
        }
      } catch (e: any) {
        this.error = e.response?.data?.message || "Failed to update webhook";
        throw e;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteChannelWebhook(channelId: string, webhookId: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.deleteChannelWebhook(channelId, webhookId);
        if (response.ok) {
          // Refresh channels to get updated webhook data
          await this.fetchChannels();
        }
      } catch (e: any) {
        this.error = e.response?.data?.message || "Failed to delete webhook";
        throw e;
      } finally {
        this.isLoading = false;
      }
    },

    async toggleChannelWebhook(
      channelId: string,
      webhookId: string,
      isActive: boolean
    ) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.updateChannelWebhook(channelId, webhookId, {
          isActive,
        });
        if (response.ok) {
          // Refresh channels to get updated webhook data
          await this.fetchChannels();
        }
      } catch (e: any) {
        this.error = e.response?.data?.message || "Failed to toggle webhook";
        throw e;
      } finally {
        this.isLoading = false;
      }
    },

    // Subscribe to channel events via socket
    subscribeToChannel(channelId: string) {
      console.log(
        "🔌 Socket status:",
        socket.connected,
        "for channel:",
        channelId
      );
      if (socket.connected) {
        console.log(`📺 Subscribing to channel: ${channelId}`);
        socket.emit("subscribe_channel", { channelId });
      } else {
        console.warn(
          `⚠️ Cannot subscribe to channel ${channelId}: Socket not connected`
        );
      }
    },
    // Unsubscribe from channel events via socket
    unsubscribeFromChannel(channelId: string) {
      if (socket.connected) {
        console.log(`📺 Unsubscribing from channel: ${channelId}`);
        socket.emit("unsubscribe_channel", { channelId });
      }
    },
    // Subscribe to all channels (they need to be subscribed to receive any events)
    subscribeToAllChannels() {
      this.channels.forEach((channel) => {
        this.subscribeToChannel(channel.channelId);
      });
    },
    // Initialize method for component mounting
    async initialize() {
      console.log("🚀 Initializing channel store...");
      this.listenToEvents();
      try {
        await this.fetchChannels();
        console.log(
          "📋 Channels fetched, existing channels:",
          this.channels.length
        );
        // If socket is already connected, subscribe immediately
        // Otherwise, the connect event handler will subscribe
        if (socket.connected) {
          console.log(
            "📺 Socket connected, subscribing to all existing channels"
          );
          this.subscribeToAllChannels();
        } else {
          console.log(
            "⏳ Socket not connected yet, will subscribe when connected"
          );
        }
      } catch (error) {
        console.error("❌ Failed to initialize channels:", error);
        throw error;
      }
    },
  },
});
