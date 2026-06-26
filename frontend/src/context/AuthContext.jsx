import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('nexora_token'));
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user session on boot
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          // 1. Fetch user profile
          const userRes = await api.get('/auth/profile');
          setUser(userRes.data.user);
          localStorage.setItem('nexora_user', JSON.stringify(userRes.data.user));

          // 2. Fetch workspaces
          const wsRes = await api.get('/workspaces');
          setWorkspaces(wsRes.data.workspaces);

          // 3. Set active workspace (last selected or first in list)
          if (wsRes.data.workspaces.length > 0) {
            const savedWsId = localStorage.getItem('nexora_active_ws_id');
            const match = wsRes.data.workspaces.find(w => w.id === parseInt(savedWsId, 10));
            
            const active = match || wsRes.data.workspaces[0];
            setActiveWorkspace(active);
            localStorage.setItem('nexora_active_ws_id', active.id);
          }
        } catch (err) {
          console.error('Failed to restore session:', err.message);
          // Clear credentials if token is expired/invalid
          logoutState();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const logoutState = () => {
    setUser(null);
    setToken(null);
    setWorkspaces([]);
    setActiveWorkspace(null);
    localStorage.removeItem('nexora_token');
    localStorage.removeItem('nexora_user');
    localStorage.removeItem('nexora_active_ws_id');
  };

  const login = async (email, password, rememberMe = false) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password, rememberMe });
      
      const jwtToken = res.data.token;
      const loggedUser = res.data.user;

      localStorage.setItem('nexora_token', jwtToken);
      localStorage.setItem('nexora_user', JSON.stringify(loggedUser));
      setToken(jwtToken);
      setUser(loggedUser);

      // Load workspaces immediately
      const wsRes = await api.get('/workspaces');
      setWorkspaces(wsRes.data.workspaces);

      if (wsRes.data.workspaces.length > 0) {
        setActiveWorkspace(wsRes.data.workspaces[0]);
        localStorage.setItem('nexora_active_ws_id', wsRes.data.workspaces[0].id);
      }

      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const register = async (name, email, password, role, additionalFields = {}) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
        ...additionalFields
      });

      const jwtToken = res.data.token;
      const loggedUser = res.data.user;

      localStorage.setItem('nexora_token', jwtToken);
      localStorage.setItem('nexora_user', JSON.stringify(loggedUser));
      setToken(jwtToken);
      setUser(loggedUser);

      // A default workspace is auto-created or we fetch what exists
      const wsRes = await api.get('/workspaces');
      setWorkspaces(wsRes.data.workspaces);

      if (wsRes.data.workspaces.length > 0) {
        setActiveWorkspace(wsRes.data.workspaces[0]);
        localStorage.setItem('nexora_active_ws_id', wsRes.data.workspaces[0].id);
      }

      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API warning:', err.message);
    } finally {
      logoutState();
    }
  };

  const switchWorkspace = (wsId) => {
    const match = workspaces.find(w => w.id === parseInt(wsId, 10));
    if (match) {
      setActiveWorkspace(match);
      localStorage.setItem('nexora_active_ws_id', match.id);
    }
  };

  const createWorkspace = async (name, description, avatar) => {
    try {
      const res = await api.post('/workspaces', { name, description, avatar });
      const newWs = res.data.workspace;
      
      const list = [...workspaces, newWs];
      setWorkspaces(list);
      setActiveWorkspace(newWs);
      localStorage.setItem('nexora_active_ws_id', newWs.id);
      
      return newWs;
    } catch (err) {
      throw err;
    }
  };

  const refreshWorkspaces = async () => {
    try {
      const wsRes = await api.get('/workspaces');
      setWorkspaces(wsRes.data.workspaces);
    } catch (err) {
      console.warn('Failed to refresh workspaces:', err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        workspaces,
        activeWorkspace,
        loading,
        login,
        register,
        logout,
        switchWorkspace,
        createWorkspace,
        refreshWorkspaces,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
