import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Establish connection to backend socket server
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    console.log('Socket.io connection initializing...');

    return () => {
      newSocket.disconnect();
      console.log('Socket.io disconnected');
    };
  }, []);

  useEffect(() => {
    if (socket && user) {
      // Register user on socket connection
      socket.emit('user:register', {
        userId: user.id,
        role: user.role
      });
      console.log(`Registered user ${user.id} on socket server`);
    }
  }, [socket, user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
