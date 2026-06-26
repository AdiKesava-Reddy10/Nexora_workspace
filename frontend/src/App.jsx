import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Context Providers
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';

// Components & Layout
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

// Page Views
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { Tasks } from './pages/Tasks';
import { CalendarView } from './pages/Calendar';
import { Chat } from './pages/Chat';
import { Reports } from './pages/Reports';
import { Profile } from './pages/Profile';
import { SettingsPage } from './pages/Settings';
import { AdminPanel } from './pages/Admin';
import { HelpGuide } from './pages/Help';
import { AboutNexora } from './pages/About';
import { NotFound } from './pages/NotFound';

const queryClient = new QueryClient();

// Protected Route Wrapper
const ProtectedLayout = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#080512]">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl animate-bounce">
          N
        </div>
        <span className="text-xs text-slate-400 mt-4 tracking-widest font-semibold uppercase animate-pulse-slow">
          Loading Nexora Workspace...
        </span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080512] transition-colors duration-300">
      {/* Sidebar Layout */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Admin Route Guard
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <NotificationProvider>
              <Router>
                <Routes>
                  {/* Public Onboarding Pages */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected SaaS App shell */}
                  <Route element={<ProtectedLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/calendar" element={<CalendarView />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/help" element={<HelpGuide />} />
                    <Route path="/about" element={<AboutNexora />} />

                    {/* Admin Panel guarded */}
                    <Route 
                      path="/admin" 
                      element={
                        <AdminRoute>
                          <AdminPanel />
                        </AdminRoute>
                      } 
                    />
                  </Route>

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
            </NotificationProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
