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
    const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace('/api/v1', '');
    const socketInstance = io(socketUrl);
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
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            padding: '12px 18px',
            color: '#0f172a',
            fontSize: '13px',
            fontWeight: '600',
            borderRadius: '16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            maxWidth: '320px', // Restricts width on mobile so it doesn't fill full screen
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <AppRoutes />
    </div>
  );
}

export default App;
