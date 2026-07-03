import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, token } = useAuth();

  useEffect(() => {
    if (!token) {
      setSocket(null);
      return;
    }

    // Establish connection to backend socket server sending JWT token
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: token
      }
    });
    setSocket(newSocket);

    console.log('Socket.io connection initializing with token...');

    return () => {
      newSocket.disconnect();
      console.log('Socket.io disconnected');
    };
  }, [token]);

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
