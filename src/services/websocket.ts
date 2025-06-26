import { io } from "socket.io-client";

const URL = "http://localhost:4500";
const socket = io(URL, {
  autoConnect: false, // We will connect manually
});

export default socket;
