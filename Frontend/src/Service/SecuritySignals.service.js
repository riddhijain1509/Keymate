import { io } from "socket.io-client";

const backendURL = import.meta.env?.VITE_BACKEND_URL;
let socketInstance = null;

export const connectSecuritySignals = () => {
  const token = localStorage.getItem("accessToken");
  if (!token || !backendURL) return null;

  if (socketInstance?.connected) {
    return socketInstance;
  }

  if (!socketInstance) {
    socketInstance = io(backendURL, {
      transports: ["websocket"],
      auth: {
        token,
      },
    });
  }

  return socketInstance;
};

export const disconnectSecuritySignals = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
