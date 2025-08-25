import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'https://pet-shop-api-server.onrender.com/message';

export default function useSocket(token?: string | null) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    if (!token) return;
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token },
      autoConnect: true,
      reconnection: true,
    });
    return () => {
      socketRef.current?.disconnect();
    };
  }, [token]);

  return socketRef.current;
}