import { io } from "socket.io-client";

const SOCKET_URL = "http://192.168.100.57:5001";

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: true,
});

export default socket;
