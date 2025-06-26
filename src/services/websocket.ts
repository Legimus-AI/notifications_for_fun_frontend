import { io } from "socket.io-client";
import { WS_CONFIG } from "@/config";

const socket = io(WS_CONFIG.URL, {
  autoConnect: false, // We will connect manually
  reconnection: true,
  reconnectionAttempts: WS_CONFIG.RECONNECT_ATTEMPTS,
  reconnectionDelay: WS_CONFIG.RECONNECT_DELAY,
});

export default socket;
