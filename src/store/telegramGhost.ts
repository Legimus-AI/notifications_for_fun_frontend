import { defineStore } from "pinia";
import type { TelegramChannel, CreateTelegramChannelRequest } from "@/types/telegramGhost";
import api from "@/services/api";

interface TelegramGhostState {
  channels: TelegramChannel[];
  isLoading: boolean;
  error: string | null;
  loginModal: {
    isOpen: boolean;
    channelId: string;
    isVerifying: boolean;
    verificationStatus: string | null;
    showSuccess: boolean;
  };
}

const mapTelegramChannel = (apiChannel: any): TelegramChannel => ({
  id: apiChannel.channelId || apiChannel.id,
  channelId: apiChannel.channelId || apiChannel.id,
  name: apiChannel.name,
  apiId: apiChannel.apiId || 0,
  apiHash: apiChannel.apiHash || '',
  phoneNumber: apiChannel.config?.phoneNumber || apiChannel.phoneNumber,
  password2FA: apiChannel.password2FA,
  status: apiChannel.status,
  isActive: apiChannel.isActive,
  lastActivity: apiChannel.lastActivity,
  createdAt: apiChannel.createdAt,
  updatedAt: apiChannel.updatedAt,
});

export const useTelegramGhostStore = defineStore("telegramGhost", {
  state: (): TelegramGhostState => ({
    channels: [],
    isLoading: false,
    error: null,
    loginModal: {
      isOpen: false,
      channelId: "",
      isVerifying: false,
      verificationStatus: null,
      showSuccess: false,
    },
  }),
  getters: {
    getChannelById: (state) => (channelId: string) => {
      return state.channels.find((c) => c.channelId === channelId);
    },
    authenticatedChannels: (state) => {
      return state.channels.filter((c) => c.status === "authenticated" || c.status === "active");
    },
    activeChannels: (state) => {
      return state.channels.filter((c) => c.isActive);
    },
  },
  actions: {
    async fetchChannels() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.getAllTelegramChannels();
        if (response.ok && response.payload) {
          this.channels = Array.isArray(response.payload)
            ? response.payload.map(mapTelegramChannel)
            : [];
        }
      } catch (e: any) {
        const errorMessage =
          e.response?.data?.message || "Failed to fetch Telegram channels.";
        this.error = errorMessage;
        throw new Error(errorMessage);
      } finally {
        this.isLoading = false;
      }
    },

    async createChannel(data: CreateTelegramChannelRequest) {
      this.error = null;
      try {
        const createResponse = await api.createTelegramChannel(data);
        if (!createResponse.ok || !createResponse.payload) {
          throw new Error("Failed to create Telegram channel");
        }

        const channel = mapTelegramChannel(createResponse.payload);
        this.channels.push(channel);
        return channel;
      } catch (e: any) {
        const errorMessage =
          e.response?.data?.message || e.message || "Failed to create Telegram channel.";
        this.error = errorMessage;
        throw new Error(errorMessage);
      }
    },

    async updateChannel(channelId: string, data: any) {
      this.error = null;
      try {
        const response = await api.updateTelegramChannel(channelId, data);
        if (!response.ok || !response.payload) {
          throw new Error("Failed to update Telegram channel");
        }

        const updatedChannel = mapTelegramChannel(response.payload);
        const index = this.channels.findIndex((c) => c.channelId === channelId);
        if (index !== -1) {
          this.channels[index] = updatedChannel;
        }
        return updatedChannel;
      } catch (e: any) {
        const errorMessage =
          e.response?.data?.message || e.message || "Failed to update Telegram channel.";
        this.error = errorMessage;
        throw new Error(errorMessage);
      }
    },

    async deleteChannel(channelId: string) {
      this.error = null;
      try {
        const response = await api.deleteTelegramChannel(channelId);
        if (response.ok) {
          this.channels = this.channels.filter((c) => c.channelId !== channelId);
        }
      } catch (e: any) {
        const errorMessage =
          e.response?.data?.message || "Failed to delete Telegram channel.";
        this.error = errorMessage;
        throw new Error(errorMessage);
      }
    },

    async initiateLogin(channelId: string) {
      this.loginModal.channelId = channelId;
      this.loginModal.isVerifying = true;
      this.error = null;

      try {
        const response = await api.initiateTelegramLogin(channelId);
        if (response.ok) {
          this.loginModal.isOpen = true;
          this.loginModal.verificationStatus = response.message || "Login code sent to your phone";
        }
      } catch (e: any) {
        const errorMessage =
          e.response?.data?.message || "Failed to initiate login.";
        this.error = errorMessage;
        this.loginModal.isVerifying = false;
        throw new Error(errorMessage);
      } finally {
        this.loginModal.isVerifying = false;
      }
    },

    async verifyLogin(channelId: string, phoneCode: string, password?: string) {
      this.loginModal.isVerifying = true;
      this.error = null;

      try {
        const response = await api.verifyTelegramLogin(channelId, {
          phoneCode,
          password,
        });
        
        if (response.ok && response.payload?.authenticated) {
          this.loginModal.showSuccess = true;
          this.loginModal.verificationStatus = "Successfully authenticated!";
          
          const channel = this.channels.find((c) => c.channelId === channelId);
          if (channel) {
            channel.status = "authenticated";
          }

          setTimeout(() => {
            this.closeLoginModal();
          }, 2000);
        }
      } catch (e: any) {
        const errorMessage =
          e.response?.data?.message || "Failed to verify login code.";
        this.error = errorMessage;
        this.loginModal.verificationStatus = errorMessage;
        throw new Error(errorMessage);
      } finally {
        this.loginModal.isVerifying = false;
      }
    },

    async refreshChannelStatus(channelId: string) {
      try {
        const response = await api.getTelegramChannelStatus(channelId);
        if (response.ok && response.payload) {
          const channel = this.channels.find((c) => c.channelId === channelId);
          if (channel) {
            channel.status = response.payload.status;
            channel.lastActivity = response.payload.lastActivity;
          }
        }
      } catch (e: any) {
        console.error("Failed to refresh channel status:", e);
      }
    },

    async sendMessage(channelId: string, recipient: string, text: string) {
      this.error = null;
      try {
        const response = await api.sendTelegramMessage(channelId, {
          recipient,
          text,
        });
        return response;
      } catch (e: any) {
        const errorMessage =
          e.response?.data?.message || "Failed to send message.";
        this.error = errorMessage;
        throw new Error(errorMessage);
      }
    },

    async sendAlert(channelId: string, recipient: string, message?: string, soundFile?: string, duration?: number) {
      this.error = null;
      try {
        const response = await api.sendTelegramAlert(channelId, {
          recipient,
          message,
          soundFile,
          duration,
        });
        return response;
      } catch (e: any) {
        const errorMessage =
          e.response?.data?.message || "Failed to send alert.";
        this.error = errorMessage;
        throw new Error(errorMessage);
      }
    },

    async makeCall(channelId: string, recipient: string, wakeUpMessage?: string, ttsText?: string, ttsVoice?: string) {
      console.log("aaaa")
      this.error = null;
      try {
        // Debug logging
        console.log('makeCall params:', { wakeUpMessage, ttsText, ttsVoice });
        
        const requestData: any = { recipient };
        
        // Only include fields that have actual values
        if (wakeUpMessage && wakeUpMessage.trim() !== '') {
          requestData.wakeUpMessage = wakeUpMessage;
        }
        if (ttsText && ttsText.trim() !== '') {
          requestData.ttsText = ttsText;
        }
        if (ttsVoice && ttsVoice.trim() !== '') {
          requestData.ttsVoice = ttsVoice;
        }
        
        console.log('Request data being sent:', requestData);
        const response = await api.makeTelegramCall(channelId, requestData);
        return response;
      } catch (e: any) {
        const errorMessage =
          e.response?.data?.message || "Failed to make call.";
        this.error = errorMessage;
        throw new Error(errorMessage);
      }
    },

    openLoginModal(channelId: string) {
      this.loginModal.isOpen = true;
      this.loginModal.channelId = channelId;
      this.loginModal.showSuccess = false;
      this.loginModal.verificationStatus = null;
    },

    closeLoginModal() {
      this.loginModal.isOpen = false;
      this.loginModal.channelId = "";
      this.loginModal.isVerifying = false;
      this.loginModal.verificationStatus = null;
      this.loginModal.showSuccess = false;
    },
  },
});
