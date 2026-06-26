import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Folder, CheckSquare, Settings, User, Moon, Sun, Monitor, HelpCircle, Terminal } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const { setTheme } = useTheme();
  const { activeWorkspace, logout } = useAuth();
  
  const navigate = useNavigate();
  const modalRef = useRef();

  // Listen to Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch results when search text changes
  useEffect(() => {
    if (!isOpen) return;
    
    const searchWorkspace = async () => {
      if (!search.trim()) {
        // Return default action suggestions
        setResults([
          { type: 'navigation', label: 'Go to Dashboard', icon: Terminal, action: () => navigate('/dashboard') },
          { type: 'navigation', label: 'View Kanban Board', icon: CheckSquare, action: () => navigate('/tasks') },
          { type: 'navigation', label: 'Open Workspace Chat', icon: HelpCircle, action: () => navigate('/chat') },
          { type: 'navigation', label: 'View Projects Grid', icon: Folder, action: () => navigate('/projects') },
          { type: 'action', label: 'Toggle Dark Mode', icon: Moon, action: () => setTheme('dark') },
          { type: 'action', label: 'Toggle Light Mode', icon: Sun, action: () => setTheme('light') },
          { type: 'action', label: 'Toggle System Theme', icon: Monitor, action: () => setTheme('system') },
          { type: 'navigation', label: 'User Profile & Settings', icon: User, action: () => navigate('/profile') },
        ]);
        return;
      }

      try {
        if (!activeWorkspace) return;
        // Search Projects & Tasks via API
        const projRes = await api.get(`/projects?workspaceId=${activeWorkspace.id}`);
        const taskRes = await api.get(`/tasks?workspaceId=${activeWorkspace.id}`);

        const matchingProjs = projRes.data.projects
          .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
          .map(p => ({
            type: 'project',
            label: `Project: ${p.name}`,
            icon: Folder,
            action: () => navigate(`/projects?id=${p.id}`)
          }));

        const matchingTasks = taskRes.data.tasks
          .filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
          .map(t => ({
            type: 'task',
            label: `Task: ${t.title} (${t.status})`,
            icon: CheckSquare,
            action: () => navigate('/tasks') // navigate to tasks board
          }));

        setResults([...matchingProjs, ...matchingTasks]);
      } catch (err) {
        console.warn('Search query failed:', err.message);
      }
    };

    const timer = setTimeout(searchWorkspace, 150);
    return () => clearTimeout(timer);
  }, [search, isOpen, activeWorkspace]);

  // Handle keyboard selections (up, down, enter)
  useEffect(() => {
    const handleNavigation = (e) => {
      if (!isOpen || results.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        results[selectedIndex].action();
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleNavigation);
    return () => window.removeEventListener('keydown', handleNavigation);
  }, [isOpen, results, selectedIndex]);

  // Click outside close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4">
      <div
        ref={modalRef}
        className="w-full max-w-xl glass-panel overflow-hidden border border-slate-200/50 dark:border-slate-800/80 shadow-2xl flex flex-col"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200/50 dark:border-slate-800/80">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            autoFocus
            type="text"
            className="w-full bg-transparent border-none text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-base"
            placeholder="Type a command or search projects & tasks..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs text-slate-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded">
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2 flex flex-col gap-1">
          {results.length > 0 ? (
            results.map((r, index) => {
              const Icon = r.icon;
              return (
                <button
                  key={index}
                  onClick={() => {
                    r.action();
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                    index === selectedIndex
                      ? 'bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 font-medium'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${index === selectedIndex ? 'text-brand-500' : 'text-slate-400'}`} />
                    <span className="text-sm">{r.label}</span>
                  </div>
                  {index === selectedIndex && (
                    <span className="text-xs text-brand-500 font-normal">Enter ↵</span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="p-4 text-center text-sm text-slate-400">
              No results found for "{search}"
            </div>
          )}
        </div>

        {/* Guide footer */}
        <div className="px-4 py-2 border-t border-slate-200/50 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 flex justify-between items-center text-xs text-slate-400">
          <span>Use ↑↓ to navigate, ↵ to select</span>
          <span>Press Ctrl+K to close</span>
        </div>
      </div>
    </div>
  );
};
