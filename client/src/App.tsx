import React, { useEffect, useState } from 'react';
import AppRoutes from './routes/AppRoutes';
import Cookies from 'js-cookie';
import { io, Socket } from 'socket.io-client';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';
import { Shield, Clock, Check, X } from 'lucide-react';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = io('http://localhost:3000');
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('🔌 WebSocket is connected to SMS Server');
    });

    const userId = Cookies.get('id');
    if (userId) {
      socketInstance.emit('register_user', userId);
    }

    // Listen for general notices
    socketInstance.on('new_notice', (data) => {
      toast.success(`📢 Announcement: ${data.message}`, {
        duration: 8000,
        style: {
          border: '1px solid #3b82f6',
          padding: '16px',
          color: '#1e3a8a',
          borderRadius: '12px',
        },
      });
    });

    // Listen for complaint updates
    socketInstance.on('complaint_status_update', (data) => {
      toast.success(`🔔 Status Update: ${data.message}`, {
        duration: 8000,
        style: {
          border: '1px solid #2563eb',
          padding: '16px',
          color: '#1e3a8a',
          borderRadius: '12px',
        },
      });
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <div className="App relative min-h-screen">
      <Toaster position="top-right" />
      <AppRoutes />
    </div>
  );
}

export default App;
