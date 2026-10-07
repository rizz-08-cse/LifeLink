import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, donorProfile } = useAuth();
  const [socket, setSocket] = useState(null);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to backend Socket.IO
    const socketInstance = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected to real-time notification engine with id:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
      setIsConnected(false);
    });

    // Listen for emergency alerts
    socketInstance.on('emergency_blood_alert', (data) => {
      console.log('[Socket] Emergency Blood Alert received:', data);
      setActiveAlerts((prev) => [
        {
          id: Date.now(),
          type: 'EMERGENCY',
          title: `CRITICAL NEED: ${data.bloodGroup} Blood Required!`,
          message: `${data.unitsNeeded} unit(s) needed at ${data.hospitalName} for ${data.patientName}.`,
          data
        },
        ...prev
      ]);
    });

    // Listen for donor accept notification (for requesters)
    socketInstance.on('donor_accepted_request', (data) => {
      console.log('[Socket] Donor Accepted Request:', data);
      setActiveAlerts((prev) => [
        {
          id: Date.now(),
          type: 'ACCEPTED',
          title: 'Donor Matched!',
          message: data.message,
          data
        },
        ...prev
      ]);
    });

    // Listen for donation completion celebration
    socketInstance.on('donation_completed_celebration', (data) => {
      setActiveAlerts((prev) => [
        {
          id: Date.now(),
          type: 'CELEBRATION',
          title: 'Donation Recorded!',
          message: data.message,
          data
        },
        ...prev
      ]);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Join rooms when user / donorProfile changes
  useEffect(() => {
    if (!socket || !isConnected) return;

    if (user?._id) {
      socket.emit('join_user', user._id);
    }

    if (donorProfile?.bloodGroup) {
      socket.emit('join_blood_group', donorProfile.bloodGroup);
    }
  }, [socket, isConnected, user, donorProfile]);

  const dismissAlert = (alertId) => {
    setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const joinRequestRoom = (requestId) => {
    if (socket && requestId) {
      socket.emit('join_request', requestId);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        activeAlerts,
        dismissAlert,
        joinRequestRoom
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
