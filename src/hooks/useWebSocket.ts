import { useEffect } from "react";

export function useWebSocket(url: string, onMessage: (data: string) => void) {
  useEffect(() => {
    const socket = new WebSocket(url);
    socket.addEventListener("message", (event) => onMessage(event.data));
    return () => socket.close();
  }, [url, onMessage]);
}
