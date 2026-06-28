import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { getNotifications, markRead, markAllRead } from '../services/notificationService';
import toast from 'react-hot-toast';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  // Fetch initial notifications when user logs in
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        setNotifications([]);
        return;
      }
      try {
        const response = await getNotifications();
        if (response.success) {
          setNotifications(response.data);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();
  }, [user]);

  // Establish socket.io connection when user logs in
  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const newSocket = io('http://localhost:5001', {
      transports: ['websocket'],
      upgrade: false
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected client-side:', newSocket.id);
      newSocket.emit('join_user_room', user.id || user._id);
    });

    newSocket.on('new_notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      
      // Play a subtle sound or trigger toast notification
      toast.success(
        <div className="flex flex-col">
          <span className="font-semibold text-brand-navy">{notification.title}</span>
          <span className="text-xs text-brand-muted">{notification.message}</span>
        </div>,
        { duration: 4000 }
      );
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const handleMarkRead = async (id) => {
    try {
      const response = await markRead(id);
      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await markAllRead();
      if (response.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success('All notifications marked as read');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        socket,
        markAsRead: handleMarkRead,
        markAllRead: handleMarkAllRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
