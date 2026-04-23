import { io } from "socket.io-client";

// Reuse existing socket across hot reloads to avoid duplicate connections
if (!window._socket) {
  window._socket = io("http://localhost:4000");
}

const socket = window._socket;

export default socket;
