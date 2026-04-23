import { io } from "socket.io-client";

if (!window._socket) {
  window._socket = io("https://chat-city.onrender.com");
}

const socket = window._socket;

export default socket;
