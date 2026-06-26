import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, activeWorkspace } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect to backend Socket server only when user is authenticated
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const socketUrl = 'http://localhost:5000';
    console.log(`Initializing WebSockets connection to ${socketUrl}...`);
    
    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 10000
    });

    socketInstance.on('connect', () => {
      console.log('WebSockets connected to server.');
      setConnected(true);

      // Join active workspace room if exists
      if (activeWorkspace) {
        socketInstance.emit('join_workspace', {
          workspaceId: activeWorkspace.id,
          userId: user.id
        });
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('WebSockets disconnected from server.');
      setConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.warn('WebSockets connection failed (running in offline local-only sync):', error.message);
      setConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  // Sync workspace room when activeWorkspace shifts
  useEffect(() => {
    if (socket && connected && activeWorkspace && user) {
      socket.emit('join_workspace', {
        workspaceId: activeWorkspace.id,
        userId: user.id
      });
    }
  }, [activeWorkspace, socket, connected, user]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  return context || { socket: null, connected: false }; // Safe fallback
};
