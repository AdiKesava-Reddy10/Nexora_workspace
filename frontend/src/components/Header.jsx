import React, { useState, useEffect } from 'react';
import { Bell, Search, Sun, Moon, Monitor, Database, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { CommandPalette } from './CommandPalette';
import api from '../services/api';

export const Header = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  
  const [dbMode, setDbMode] = useState('Checking...');
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [greeting, setGreeting] = useState('');

  // 1. Compute dynamic greeting
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting('Good morning');
    else if (hours < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // 2. Fetch database status from /health
  useEffect(() => {
    const checkDbHealth = async () => {
      try {
        const res = await api.get('http://localhost:5000/health');
        setDbMode(res.data.databaseMode);
      } catch (err) {
        setDbMode('JSON Fallback File'); // assumed fallback if health fails
      }
    };
    checkDbHealth();
  }, []);

  const unreadNotifs = notifications.filter((n) => !n.isRead);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/70 dark:bg-[#080512]/60 backdrop-blur-md border-b border-slate-200/40 dark:border-slate-800/40 px-6 py-4 flex items-center justify-between">
      {/* Sidebar mobile menu trigger */}
      <button onClick={onMenuClick} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors mr-2">
        <Menu className="w-5 h-5" />
      </button>

      {/* Greeting & Welcome */}
      <div className="hidden sm:block">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          {greeting}, {user?.name?.split(' ')[0] || 'Member'}!
        </h2>
        <p className="text-xs text-slate-400 font-medium">Coordinate your workspace and deliver milestones.</p>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4 ml-auto sm:ml-0">
        
        {/* Database Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-800/60 bg-slate-50/50 dark:bg-white/5 text-[10px] font-bold">
          <Database className={`w-3.5 h-3.5 ${dbMode.includes('MySQL') ? 'text-emerald-500 animate-pulse-slow' : 'text-violet-500'}`} />
          <span className="text-slate-500 dark:text-slate-400 tracking-wide uppercase">{dbMode}</span>
        </div>

        {/* Global Search command palette trigger */}
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/30 dark:border-slate-800/50 bg-slate-50/50 dark:bg-white/5 text-xs text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all w-36 sm:w-44 text-left cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="flex-1">Search (Ctrl+K)</span>
        </button>

        {/* Theme Toggle Trigger */}
        <div className="relative">
          <button
            onClick={() => {
              setShowThemeDropdown(!showThemeDropdown);
              setShowNotifDropdown(false);
            }}
            className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100/50 dark:hover:bg-white/5 transition-all"
          >
            {theme === 'dark' ? <Moon className="w-4 h-4 text-violet-400" /> : theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Monitor className="w-4 h-4" />}
          </button>

          {showThemeDropdown && (
            <div className="absolute right-0 mt-2 w-36 glass-panel p-1.5 border border-white/20 shadow-xl flex flex-col gap-0.5">
              <button
                onClick={() => { setTheme('light'); setShowThemeDropdown(false); }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-medium"
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" /> Light
              </button>
              <button
                onClick={() => { setTheme('dark'); setShowThemeDropdown(false); }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-medium"
              >
                <Moon className="w-3.5 h-3.5 text-violet-400" /> Dark
              </button>
              <button
                onClick={() => { setTheme('system'); setShowThemeDropdown(false); }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-medium"
              >
                <Monitor className="w-3.5 h-3.5 text-slate-400" /> System
              </button>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifDropdown(!showNotifDropdown);
              setShowThemeDropdown(false);
            }}
            className="relative p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100/50 dark:hover:bg-white/5 transition-all"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse-slow" />
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 glass-panel p-4 border border-white/20 shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/40 pb-2">
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Alerts & Messages</span>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] text-brand-500 font-bold hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-2.5 rounded-lg text-left cursor-pointer border transition-all ${
                        n.isRead
                          ? 'bg-transparent border-transparent opacity-60'
                          : 'bg-brand-500/5 dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-brand-500/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{n.title}</span>
                        {!n.isRead && (
                          <span className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-1.5 shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No active notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Embedded Command Palette modal listening globally */}
      <CommandPalette />
    </header>
  );
};
