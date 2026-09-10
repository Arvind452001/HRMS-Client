import { io } from "socket.io-client";
import { baseURL } from "./baseUrlConfig";

// socket.io connects to the server root, not the "/api" prefix used by REST
const SOCKET_URL = baseURL.replace(/\/api\/?$/, "");

let socket = null;

// Get or create the shared socket connection, reusing the axios access token.
export function getSocket() {
  const token = localStorage.getItem("technoToken");
  if (!token) return null;

  if (socket && socket.connected) return socket;

  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 2000,
    });
  } else {
    // Token may have changed (re-login) — refresh it before reconnecting
    socket.auth = { token };
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
