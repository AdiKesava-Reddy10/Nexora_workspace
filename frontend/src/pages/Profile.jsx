import React, { useState } from 'react';
import { User, Phone, Key, ShieldCheck, Mail, Save, PlusCircle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';

export const Profile = () => {
  const { user, setUser } = useAuth();
  const { addToast } = useNotifications();

  // Profile forms
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profession, setProfession] = useState(user?.profession || 'Developer');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [skills, setSkills] = useState(user?.skills || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Password forms
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', {
        name,
        phone,
        profession,
        organization,
        skills,
        bio,
        avatar
      });

      setUser(res.data.user);
      localStorage.setItem('nexora_user', JSON.stringify(res.data.user));
      addToast('Success', 'Profile details updated successfully.', 'success');
    } catch (err) {
      addToast('Error', err.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;

    if (newPassword !== confirmPassword) {
      addToast('Error', 'Confirm password does not match.', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      await api.put('/auth/profile', {
        oldPassword,
        newPassword
      });

      addToast('Success', 'Password changed successfully.', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      addToast('Error', err.message || 'Failed to change password.', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <User className="w-6 h-6 text-brand-500" />
          My Profile settings
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">Configure profile avatars, change credentials, and manage developer skilltags.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar Card */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="p-6 glass-panel border-white/20 text-center flex flex-col items-center gap-4">
            <img
              src={avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt="Avatar"
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-brand-500/20 shadow-lg"
            />
            <div>
              <h2 className="font-bold text-base text-slate-800 dark:text-slate-100">{user?.name}</h2>
              <span className="text-xs text-slate-400 font-semibold">{user?.role}</span>
            </div>
            
            <p className="text-xs text-slate-400 italic leading-relaxed px-4">
              "{bio || 'No bio description configured. Write details in your profile settings.'}"
            </p>

            <div className="w-full border-t border-slate-200/20 dark:border-white/5 pt-4 flex flex-col gap-2 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Email Address</span>
                <span className="font-semibold text-slate-300 truncate max-w-[150px]">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Organization</span>
                <span className="font-semibold text-slate-300">{organization || 'Independent'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Presence</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" /> Online
                </span>
              </div>
            </div>
          </div>

          {/* Skill Tag list visualization */}
          <div className="p-6 glass-panel border-white/20 flex flex-col gap-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Developer Skill tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {skills ? (
                skills.split(',').map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-brand-500/10 border border-brand-500/20 rounded-lg text-[10px] font-bold text-brand-400 uppercase">
                    {skill.trim()}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No skills registered yet.</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Columns: Edit details & passwords */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Edit form */}
          <div className="p-6 glass-panel border-white/20">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 border-b border-slate-200/40 dark:border-slate-800/40 pb-3 mb-4">
              Profile Configurations
            </h3>

            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-400">FULL NAME</label>
                  <input required type="text" className="glass-input text-xs bg-slate-900/30 text-white" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-400">PHONE NUMBER</label>
                  <input type="text" className="glass-input text-xs bg-slate-900/30 text-white" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-400">PROFESSION / TITLE</label>
                  <input type="text" className="glass-input text-xs bg-slate-900/30 text-white" value={profession} onChange={(e) => setProfession(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-400">ORGANIZATION / COLLEGE</label>
                  <input type="text" className="glass-input text-xs bg-slate-900/30 text-white" value={organization} onChange={(e) => setOrganization(e.target.value)} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-400">PROFILE PICTURE URL</label>
                <input type="text" className="glass-input text-xs bg-slate-900/30 text-white" value={avatar} onChange={(e) => setAvatar(e.target.value)} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-400">BIO</label>
                <textarea className="glass-input text-xs h-20 resize-none bg-slate-900/30 text-white" value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-400">SKILLS (COMMA SEPARATED)</label>
                <input type="text" className="glass-input text-xs bg-slate-900/30 text-white" value={skills} onChange={(e) => setSkills(e.target.value)} />
              </div>

              <button
                disabled={savingProfile}
                type="submit"
                className="w-fit py-2 px-5 bg-brand-500 hover:bg-brand-600 rounded-xl text-white font-bold transition-all shadow-md shadow-brand-500/25 self-end flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> {savingProfile ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          </div>

          {/* Change password form */}
          <div className="p-6 glass-panel border-white/20">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 border-b border-slate-200/40 dark:border-slate-800/40 pb-3 mb-4">
              Security & Credentials Change
            </h3>

            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-400">CURRENT PASSWORD</label>
                <input required type="password" placeholder="••••••••" className="glass-input text-xs bg-slate-900/30 text-white" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-400">NEW PASSWORD</label>
                  <input required type="password" placeholder="••••••••" className="glass-input text-xs bg-slate-900/30 text-white" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-400">CONFIRM NEW PASSWORD</label>
                  <input required type="password" placeholder="••••••••" className="glass-input text-xs bg-slate-900/30 text-white" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
              </div>

              <button
                disabled={savingPassword}
                type="submit"
                className="w-fit py-2 px-5 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white font-bold transition-all shadow-md shadow-brand-500/10 self-end flex items-center gap-1.5"
              >
                <Key className="w-4 h-4" /> {savingPassword ? 'Changing...' : 'Update Password'}
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
