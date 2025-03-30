import { io } from "socket.io-client";

// Use environment variable or fallback to localhost
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL?.trim() || "http://localhost:3000";
console.log("Connecting to server at:", SOCKET_URL);

// Create and export socket instance with improved configuration
const socket = io(SOCKET_URL, {
  transports: ['polling', 'websocket'], // Try both for better compatibility
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 20000,
  autoConnect: true
});

// Debug connection events
socket.on("connect", () => {
  console.log("✅ Connected to server using", socket.io.engine.transport.name);
});

socket.on("connect_error", (error) => {
  console.error("❌ Connection error:", error.message);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from server");
});

export default socket;