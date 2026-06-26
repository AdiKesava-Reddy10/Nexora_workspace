import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FolderKanban, CheckSquare, Calendar, MessageSquare, 
  BarChart3, Settings, User, ShieldAlert, HelpCircle, Info, LogOut, 
  Menu, X, Layers, Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, workspaces, activeWorkspace, switchWorkspace, createWorkspace, logout } = useAuth();
  const [showWsModal, setShowWsModal] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsDesc, setNewWsDesc] = useState('');
  const navigate = useNavigate();

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    try {
      await createWorkspace(newWsName, newWsDesc);
      setNewWsName('');
      setNewWsDesc('');
      setShowWsModal(false);
    } catch (err) {
      console.error('Failed to create workspace:', err.message);
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Tasks (Kanban)', path: '/tasks', icon: CheckSquare },
    { name: 'Calendar & Timeline', path: '/calendar', icon: Calendar },
    { name: 'Collaboration Chat', path: '/chat', icon: MessageSquare },
    { name: 'Reports & Export', path: '/reports', icon: BarChart3 },
    { name: 'Profile Settings', path: '/profile', icon: User },
    { name: 'Workspace Config', path: '/settings', icon: Settings },
  ];

  // If user is Admin, add Admin Panel route
  if (user && user.role === 'Admin') {
    menuItems.push({ name: 'Admin Console', path: '/admin', icon: ShieldAlert });
  }

  // General routes
  const footerItems = [
    { name: 'Help & Guide', path: '/help', icon: HelpCircle },
    { name: 'About Nexora', path: '/about', icon: Info }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-[#0f0c1b]/95 backdrop-blur-md border-r border-slate-200/50 dark:border-slate-800/80 p-4 flex flex-col gap-6 transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/40 dark:border-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-brand-500/25">
              N
            </div>
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-100 tracking-tight text-md">Nexora</span>
              <span className="block text-[10px] text-brand-500 font-semibold tracking-wider uppercase -mt-1">Workspace</span>
            </div>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden p-1.5 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Dropdown */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1">ACTIVE WORKSPACE</span>
          <div className="flex items-center gap-1.5 bg-slate-100/50 dark:bg-white/5 p-2 rounded-xl border border-slate-200/30 dark:border-white/5">
            <select
              className="bg-transparent border-none text-sm text-slate-800 dark:text-slate-200 focus:outline-none w-full cursor-pointer font-medium"
              value={activeWorkspace?.id || ''}
              onChange={(e) => switchWorkspace(e.target.value)}
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id} className="dark:bg-darkBg-900 text-slate-800 dark:text-slate-200">
                  {ws.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowWsModal(true)}
              title="Create Workspace"
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-brand-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto pr-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Navigation */}
        <div className="flex flex-col gap-1 border-t border-slate-200/40 dark:border-slate-800/40 pt-3">
          {footerItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-100 dark:bg-white/5 text-brand-500'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Profile Card & Logout */}
        <div className="flex items-center justify-between bg-slate-100/50 dark:bg-white/5 p-3 rounded-xl border border-slate-200/30 dark:border-white/5 mt-auto">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt="Avatar"
              className="w-8 h-8 rounded-lg object-cover ring-2 ring-brand-500/20"
            />
            <div className="overflow-hidden">
              <span className="block font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">{user?.name}</span>
              <span className="block text-[10px] text-slate-400 truncate">{user?.role}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-slate-950/20 dark:bg-black/55 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Create Workspace Modal */}
      {showWsModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 border border-white/20 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-500" />
                Create New Workspace
              </h3>
              <button onClick={() => setShowWsModal(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">WORKSPACE NAME</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Acme Marketing, Design Sprint"
                  className="glass-input text-sm"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">DESCRIPTION (OPTIONAL)</label>
                <textarea
                  placeholder="Describe the objective of this workspace..."
                  className="glass-input text-sm h-20 resize-none"
                  value={newWsDesc}
                  onChange={(e) => setNewWsDesc(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWsModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-100/50 dark:hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg text-white font-medium text-sm transition-all shadow-md shadow-brand-500/25"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
