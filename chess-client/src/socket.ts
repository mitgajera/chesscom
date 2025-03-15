import { io } from "socket.io-client";

// Create a single socket instance to be used throughout the app
export const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
});

// Allow custom event listening from any component
export const addSocketListener = (event: string, callback: (...args: any[]) => void) => {
  socket.on(event, callback);
};

// Clean up event listeners
export const removeSocketListener = (event: string, callback?: (...args: any[]) => void) => {
  if (callback) {
    socket.off(event, callback);
  } else {
    socket.off(event);
  }
};

// Debug helper
export const enableSocketDebug = (enabled: boolean = true) => {
  if (enabled) {
    socket.onAny((event, ...args) => {
      console.log(`[Socket Debug] Event: ${event}`, args);
    });
  } else {
    socket.offAny();
  }
};