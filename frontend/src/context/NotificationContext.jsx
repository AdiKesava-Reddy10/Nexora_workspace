import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user, activeWorkspace } = useAuth();
  const { socket, connected } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Fetch notifications on login/active workspace change
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
    } catch (err) {
      console.warn('Failed to load notifications:', err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user, activeWorkspace]);

  // Subscribe to real-time socket updates for alerts
  useEffect(() => {
    if (socket && connected && user) {
      // Listen to new message alerts (if not in active chat view)
      const handleNewMessage = (msg) => {
        if (msg.senderId !== user.id) {
          addToast('New Chat Message', `${msg.sender.name}: ${msg.messageText}`, 'info');
        }
      };

      // Listen to Kanban changes
      const handleKanbanUpdate = ({ taskId, targetStatus, userId }) => {
        if (userId !== user.id) {
          addToast('Task Board Updated', `A task was moved to "${targetStatus}" by a team member.`, 'info');
          fetchNotifications();
        }
      };

      socket.on('new_message', handleNewMessage);
      socket.on('kanban_updated', handleKanbanUpdate);

      return () => {
        socket.off('new_message', handleNewMessage);
        socket.off('kanban_updated', handleKanbanUpdate);
      };
    }
  }, [socket, connected, user]);

  const addToast = (title, message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, title, message, type };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.warn('Failed to read notification:', err.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      addToast('Success', 'All notifications marked as read', 'success');
    } catch (err) {
      addToast('Error', 'Failed to update notifications', 'error');
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        toasts,
        addToast,
        removeToast,
        markAsRead,
        markAllAsRead,
        fetchNotifications
      }}
    >
      {children}
      
      {/* Toast Alerts Overlay */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-xl flex flex-col gap-1 border animate-float-medium transition-all duration-300 ${
              t.type === 'success'
                ? 'bg-emerald-50/90 dark:bg-[#062014]/90 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : t.type === 'error'
                ? 'bg-rose-50/90 dark:bg-[#250d12]/90 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                : t.type === 'warning'
                ? 'bg-amber-50/90 dark:bg-[#221808]/90 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                : 'bg-indigo-50/90 dark:bg-[#0c0d29]/90 border-indigo-300 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300'
            } backdrop-blur-md`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">{t.title}</span>
              <button
                onClick={() => removeToast(t.id)}
                className="text-xs font-bold hover:scale-115 opacity-70 hover:opacity-100 transition-all"
              >
                ✕
              </button>
            </div>
            <p className="text-xs opacity-90">{t.message}</p>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
