import React, { useState, useEffect } from 'react';
import { Settings, Users, Plus, Trash2, ShieldAlert, Mail, Layers, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';

export const SettingsPage = () => {
  const { activeWorkspace, user } = useAuth();
  const { addToast } = useNotifications();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Developer');
  const [inviting, setInviting] = useState(false);

  // Workspace configurations
  const [wsName, setWsName] = useState(activeWorkspace?.name || '');
  const [wsDesc, setWsDesc] = useState(activeWorkspace?.description || '');
  const [updatingWs, setUpdatingWs] = useState(false);

  const fetchMembers = async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    try {
      const res = await api.get(`/workspaces/${activeWorkspace.id}/members`);
      setMembers(res.data.members);
    } catch (err) {
      addToast('Error', 'Failed to retrieve workspace members list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    setWsName(activeWorkspace?.name || '');
    setWsDesc(activeWorkspace?.description || '');
  }, [activeWorkspace]);

  const handleUpdateWorkspace = async (e) => {
    e.preventDefault();
    if (!wsName.trim()) return;

    setUpdatingWs(true);
    try {
      await api.put(`/workspaces/${activeWorkspace.id}`, { name: wsName, description: wsDesc });
      addToast('Success', 'Workspace configurations updated.', 'success');
      // Reload page/reload contexts
      window.location.reload();
    } catch (err) {
      addToast('Error', 'Failed to save workspace updates.', 'error');
    } finally {
      setUpdatingWs(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    try {
      await api.post(`/workspaces/${activeWorkspace.id}/members`, {
        email: inviteEmail,
        role: inviteRole
      });
      addToast('Success', `Successfully added user to workspace.`, 'success');
      setInviteEmail('');
      fetchMembers();
    } catch (err) {
      addToast('Error', err.message || 'Invitation failed. Verify email.', 'error');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (targetUserId) => {
    if (targetUserId === user.id) {
      addToast('Warning', 'You cannot remove yourself from the workspace directly.', 'warning');
      return;
    }
    if (!window.confirm('Are you sure you want to revoke this user access to this workspace?')) return;

    try {
      await api.delete(`/workspaces/${activeWorkspace.id}/members`, {
        data: { userId: targetUserId }
      });
      addToast('Success', 'Member access revoked successfully.', 'success');
      fetchMembers();
    } catch (err) {
      addToast('Error', 'Failed to remove member.', 'error');
    }
  };

  const handleRoleChange = async (targetUserId, nextRole) => {
    try {
      await api.put(`/workspaces/${activeWorkspace.id}/members`, {
        userId: targetUserId,
        role: nextRole
      });
      addToast('Success', 'Member role updated successfully.', 'success');
      fetchMembers();
    } catch (err) {
      addToast('Error', 'Failed to change member role.', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-500" />
          Workspace Configurations & Team
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">Configure workspace names, invite developers, and assign collaborative permissions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Workspace Meta */}
        <div className="lg:col-span-1 p-6 glass-panel border-white/20">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 border-b border-slate-200/40 dark:border-slate-800/40 pb-3 mb-4 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-brand-500" />
            Workspace Details
          </h3>

          <form onSubmit={handleUpdateWorkspace} className="flex flex-col gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-400">WORKSPACE NAME</label>
              <input required type="text" className="glass-input text-xs bg-slate-900/30 text-white" value={wsName} onChange={(e) => setWsName(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-400">DESCRIPTION</label>
              <textarea className="glass-input text-xs h-24 resize-none bg-slate-900/30 text-white" value={wsDesc} onChange={(e) => setWsDesc(e.target.value)} />
            </div>

            <button
              disabled={updatingWs}
              type="submit"
              className="w-full py-2 bg-brand-500 hover:bg-brand-600 rounded-xl text-white font-bold transition-all shadow-md shadow-brand-500/25 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" /> {updatingWs ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>

        {/* Right Column: Members & Invite */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Invite Form */}
          <div className="p-6 glass-panel border-white/20">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 border-b border-slate-200/40 dark:border-slate-800/40 pb-3 mb-4 flex items-center gap-1.5">
              <Users className="w-4.5 h-4.5 text-brand-500" /> Invite Collaborator
            </h3>

            <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4 items-end text-xs">
              <div className="flex-1 flex flex-col gap-1.5 w-full">
                <label className="font-semibold text-slate-400">EMAIL ADDRESS</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    required
                    type="email"
                    placeholder="teammate@company.com"
                    className="glass-input pl-10 text-xs w-full bg-slate-900/30 text-white"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 w-full sm:w-40">
                <label className="font-semibold text-slate-400">WORKSPACE ROLE</label>
                <select
                  className="glass-input text-xs w-full bg-slate-900/30 text-white cursor-pointer select-none"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="Admin" className="bg-[#0f0c1b]">Admin</option>
                  <option value="Project Manager" className="bg-[#0f0c1b]">Project Manager</option>
                  <option value="Team Lead" className="bg-[#0f0c1b]">Team Lead</option>
                  <option value="Developer" className="bg-[#0f0c1b]">Developer</option>
                  <option value="Viewer" className="bg-[#0f0c1b]">Viewer</option>
                </select>
              </div>

              <button
                disabled={inviting}
                type="submit"
                className="py-2.5 px-5 bg-brand-500 hover:bg-brand-600 rounded-xl text-white font-bold w-full sm:w-fit shadow-md shadow-brand-500/20 shrink-0"
              >
                {inviting ? 'Adding...' : 'Invite member'}
              </button>
            </form>
          </div>

          {/* Members Table */}
          <div className="p-6 glass-panel border-white/20 overflow-hidden">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 border-b border-slate-200/40 dark:border-slate-800/40 pb-3 mb-4">
              Teammates Presence roster ({members.length})
            </h3>

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 rounded-lg bg-brand-500 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/20 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Member Details</th>
                      <th className="pb-3">Role</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => {
                      const u = m.user;
                      if (!u) return null;
                      return (
                        <tr key={m.id} className="border-b border-slate-200/10 hover:bg-white/5 transition-all">
                          <td className="py-3 flex items-center gap-3">
                            <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-lg object-cover" />
                            <div>
                              <span className="block font-bold text-slate-800 dark:text-slate-100">{u.name}</span>
                              <span className="block text-[10px] text-slate-400">{u.email}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <select
                              className="bg-transparent border border-slate-800 rounded px-1.5 py-0.5 text-slate-200 select-none cursor-pointer"
                              value={m.role}
                              disabled={u.id === user.id} // cannot change own role
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            >
                              <option value="Admin" className="bg-[#0f0c1b]">Admin</option>
                              <option value="Project Manager" className="bg-[#0f0c1b]">Project Manager</option>
                              <option value="Team Lead" className="bg-[#0f0c1b]">Team Lead</option>
                              <option value="Developer" className="bg-[#0f0c1b]">Developer</option>
                              <option value="Viewer" className="bg-[#0f0c1b]">Viewer</option>
                            </select>
                          </td>
                          <td className="py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              u.status === 'Online' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            {u.id !== user.id && (
                              <button
                                onClick={() => handleRemoveMember(u.id)}
                                className="p-1.5 rounded hover:bg-rose-500/10 text-rose-500 hover:text-rose-600 transition-all"
                                title="Revoke member access"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
