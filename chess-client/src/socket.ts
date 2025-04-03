import { io } from "socket.io-client";

// Auto-detect server URL based on environment
const serverUrl = process.env.NODE_ENV === 'production' 
  ? window.location.origin  // Same origin in production
  : "http://localhost:3000"; // Development server

const socket = io(serverUrl, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

export default socket;