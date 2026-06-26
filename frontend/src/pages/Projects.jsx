import React, { useState, useEffect } from 'react';
import { 
  Folder, Plus, Search, Filter, ArrowUpDown, MoreVertical, 
  Edit, Trash2, Archive, RotateCcw, Copy, Calendar, AlertCircle, 
  CheckCircle2, FolderArchive, Layers 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';

export const Projects = () => {
  const { activeWorkspace } = useAuth();
  const { addToast } = useNotifications();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortKey, setSortKey] = useState('newest');

  // Modal Control
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProj, setSelectedProj] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Software Development');
  const [status, setStatus] = useState('Planning');
  const [priority, setPriority] = useState('Medium');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [tags, setTags] = useState('');

  // Fetch Projects list
  const fetchProjects = async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    try {
      const res = await api.get(`/projects?workspaceId=${activeWorkspace.id}`);
      setProjects(res.data.projects);
    } catch (err) {
      addToast('Error', 'Failed to retrieve project lists.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [activeWorkspace]);

  // Form Handlers
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const payload = {
        name,
        description,
        category,
        status,
        priority,
        startDate: startDate || null,
        endDate: endDate || null,
        deadline: deadline || null,
        estimatedHours: parseFloat(estimatedHours || 0),
        tags,
        workspaceId: activeWorkspace.id
      };

      await api.post('/projects', payload);
      addToast('Success', 'Project created successfully.', 'success');
      resetForm();
      setShowCreateModal(false);
      fetchProjects();
    } catch (err) {
      addToast('Error', err.message || 'Failed to create project.', 'error');
    }
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    if (!name.trim() || !selectedProj) return;

    try {
      const payload = {
        name,
        description,
        category,
        status,
        priority,
        startDate: startDate || null,
        endDate: endDate || null,
        deadline: deadline || null,
        estimatedHours: parseFloat(estimatedHours || 0),
        tags
      };

      await api.put(`/projects/${selectedProj.id}`, payload);
      addToast('Success', 'Project updated successfully.', 'success');
      resetForm();
      setShowEditModal(false);
      fetchProjects();
    } catch (err) {
      addToast('Error', err.message || 'Failed to update project.', 'error');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Warning: Deleting this project will permanently remove all associated tasks. Proceed?')) return;
    try {
      await api.delete(`/projects/${id}`);
      addToast('Success', 'Project deleted successfully.', 'success');
      fetchProjects();
    } catch (err) {
      addToast('Error', err.message || 'Failed to delete project.', 'error');
    }
  };

  const handleArchiveProject = async (id, isArchived) => {
    try {
      if (isArchived) {
        await api.patch(`/projects/${id}/restore`);
        addToast('Success', 'Project restored successfully.', 'success');
      } else {
        await api.patch(`/projects/${id}/archive`);
        addToast('Success', 'Project archived successfully.', 'success');
      }
      fetchProjects();
    } catch (err) {
      addToast('Error', err.message || 'Failed to alter project archive state.', 'error');
    }
  };

  const handleDuplicateProject = async (id) => {
    try {
      await api.post(`/projects/${id}/duplicate`);
      addToast('Success', 'Project and tasks duplicated successfully.', 'success');
      fetchProjects();
    } catch (err) {
      addToast('Error', err.message || 'Failed to duplicate project.', 'error');
    }
  };

  // Helper bindings
  const openEditModal = (proj) => {
    setSelectedProj(proj);
    setName(proj.name);
    setDescription(proj.description || '');
    setCategory(proj.category || 'General');
    setStatus(proj.status || 'Planning');
    setPriority(proj.priority || 'Medium');
    setStartDate(proj.startDate || '');
    setEndDate(proj.endDate || '');
    setDeadline(proj.deadline || '');
    setEstimatedHours(proj.estimatedHours || '');
    setTags(proj.tags || '');
    setShowEditModal(true);
    setActiveMenuId(null);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory('Software Development');
    setStatus('Planning');
    setPriority('Medium');
    setStartDate('');
    setEndDate('');
    setDeadline('');
    setEstimatedHours('');
    setTags('');
    setSelectedProj(null);
  };

  // Filter & Sort
  const filteredProjects = projects
    .filter((p) => {
      const matchesSearch = 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        (p.tags && p.tags.toLowerCase().includes(search.toLowerCase()));
      
      if (filterStatus === 'All') return matchesSearch;
      if (filterStatus === 'Archived') return p.status === 'Archived' && matchesSearch;
      if (filterStatus === 'Completed') return p.status === 'Completed' && matchesSearch;
      if (filterStatus === 'Active') return (p.status === 'Active' || p.status === 'Planning') && matchesSearch;
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortKey === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortKey === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      if (sortKey === 'deadline') return new Date(a.deadline || '9999-12-31') - new Date(b.deadline || '9999-12-31');
      if (sortKey === 'progress') return b.progress - a.progress;
      return 0;
    });

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Folder className="w-6 h-6 text-brand-500" />
            Workspace Projects
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">Manage project categories, track milestones, and trigger duplicates.</p>
        </div>

        <button
          onClick={() => { resetForm(); setShowCreateModal(true); }}
          className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/20 w-fit"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* Control panel: Search / Filter / Sort */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 glass-panel border-white/20">
        
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search projects by name, category, or tag..."
            className="glass-input pl-10 text-xs w-full bg-slate-900/30 text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter status */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            className="glass-input text-xs w-full bg-slate-900/30 text-white select-none cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All" className="bg-darkBg-900">All Statuses</option>
            <option value="Active" className="bg-darkBg-900">Active & Planning</option>
            <option value="Completed" className="bg-darkBg-900">Completed Only</option>
            <option value="Archived" className="bg-darkBg-900">Archived Only</option>
          </select>
        </div>

        {/* Sorting */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            className="glass-input text-xs w-full bg-slate-900/30 text-white select-none cursor-pointer"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
          >
            <option value="newest" className="bg-darkBg-900">Newest Created</option>
            <option value="oldest" className="bg-darkBg-900">Oldest Created</option>
            <option value="name" className="bg-darkBg-900">Alphabetical (A-Z)</option>
            <option value="deadline" className="bg-darkBg-900">Nearest Deadline</option>
            <option value="progress" className="bg-darkBg-900">Highest Progress</option>
          </select>
        </div>

      </div>

      {/* Projects Grid Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-lg bg-brand-500 animate-spin" />
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => (
            <div 
              key={p.id} 
              className={`glass-panel border-white/20 p-5 flex flex-col gap-4 relative hover:shadow-lg transition-all duration-300 ${
                p.status === 'Archived' ? 'opacity-50' : ''
              }`}
            >
              
              {/* Category & Status Pill */}
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-extrabold uppercase text-brand-500 tracking-wider bg-brand-500/5 px-2 py-0.5 rounded-full border border-brand-500/10">
                  {p.category}
                </span>

                <div className="relative">
                  <button
                    onClick={() => setActiveMenuId(activeMenuId === p.id ? null : p.id)}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {activeMenuId === p.id && (
                    <div className="absolute right-0 mt-1 w-36 glass-panel p-1 border border-white/20 shadow-xl z-10 flex flex-col gap-0.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      <button
                        onClick={() => openEditModal(p)}
                        className="w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5"
                      >
                        <Edit className="w-3.5 h-3.5 text-indigo-400" /> Edit Project
                      </button>
                      <button
                        onClick={() => handleDuplicateProject(p.id)}
                        className="w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5"
                      >
                        <Copy className="w-3.5 h-3.5 text-cyan-400" /> Duplicate
                      </button>
                      <button
                        onClick={() => handleArchiveProject(p.id, p.status === 'Archived')}
                        className="w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5"
                      >
                        {p.status === 'Archived' ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" /> Restore
                          </>
                        ) : (
                          <>
                            <Archive className="w-3.5 h-3.5 text-amber-400" /> Archive
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteProject(p.id)}
                        className="w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2 hover:bg-rose-500/10 text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Project
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1.5 line-clamp-2">
                  {p.description || 'No description provided.'}
                </p>
              </div>

              {/* Tag Items list */}
              {p.tags && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {p.tags.split(',').map((t, idx) => (
                    <span key={idx} className="text-[8px] bg-slate-100 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 px-2 py-0.5 rounded text-slate-400 font-bold uppercase">
                      {t.trim()}
                    </span>
                  ))}
                </div>
              )}

              {/* Progress Bar & Health Rating */}
              <div className="flex flex-col gap-1 border-t border-slate-200/30 dark:border-white/5 pt-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-slate-700 dark:text-slate-300">{p.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-brand-500 h-full transition-all duration-300" style={{ width: `${p.progress}%` }} />
                </div>

                <div className="flex items-center justify-between text-[10px] mt-2 font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Health Indicator</span>
                  <span className={`${
                    p.healthScore > 80 ? 'text-emerald-400' :
                    p.healthScore > 50 ? 'text-amber-500' :
                    'text-rose-500'
                  }`}>
                    {p.healthScore}% health
                  </span>
                </div>
              </div>

              {/* Deadline & Details Footer */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold border-t border-slate-200/30 dark:border-white/5 pt-3 mt-1">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Due: {p.deadline || 'No deadline'}</span>
                </div>

                <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                  p.priority === 'Critical' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                  p.priority === 'High' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                  'bg-slate-500/10 text-slate-400'
                }`}>
                  {p.priority} PRIORITY
                </span>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 glass-panel border-white/20 text-center gap-3">
          <FolderArchive className="w-12 h-12 text-slate-400 animate-bounce" />
          <h3 className="font-bold text-sm text-slate-200">No Projects Found</h3>
          <p className="text-xs text-slate-400 max-w-sm">No project entries match your sorting or query. Add a new project to get started.</p>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 border border-white/20 shadow-2xl flex flex-col gap-4 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-500" /> Create Project Details
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            <form onSubmit={handleCreateProject} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-400">PROJECT NAME</label>
                <input required type="text" placeholder="e.g. Website V2, SEO Sprint" className="glass-input text-xs bg-slate-900/30 text-white" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-400">DESCRIPTION</label>
                <textarea placeholder="Describe the objectives..." className="glass-input text-xs h-20 resize-none bg-slate-900/30 text-white" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-400">CATEGORY</label>
                  <input type="text" placeholder="e.g. Design, Frontend" className="glass-input text-xs bg-slate-900/30 text-white" value={category} onChange={(e) => setCategory(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-400">PRIORITY</label>
                  <select className="glass-input text-xs bg-slate-900/30 text-white cursor-pointer select-none" value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="Low" className="bg-[#0f0c1b]">Low</option>
                    <option value="Medium" className="bg-[#0f0c1b]">Medium</option>
                    <option value="High" className="bg-[#0f0c1b]">High</option>
                    <option value="Critical" className="bg-[#0f0c1b]">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-400">START DATE</label>
                  <input type="date" className="glass-input text-xs bg-slate-900/30 text-white cursor-pointer" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-400">END DATE</label>
                  <input type="date" className="glass-input text-xs bg-slate-900/30 text-white cursor-pointer" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-400">DEADLINE</label>
                  <input type="date" className="glass-input text-xs bg-slate-900/30 text-white cursor-pointer" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-400">ESTIMATED HOURS</label>
                  <input type="number" step="0.1" placeholder="40" className="glass-input text-xs bg-slate-900/30 text-white" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-400">TAGS (COMMA SEPARATED)</label>
                  <input type="text" placeholder="Design, React, Dev" className="glass-input text-xs bg-slate-900/30 text-white" value={tags} onChange={(e) => setTags(e.target.value)} />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-900/20 transition-all">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg text-white font-bold transition-all shadow-md shadow-brand-500/20">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 border border-white/20 shadow-2xl flex flex-col gap-4 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" /> Edit Project Details
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            <form onSubmit={handleEditProject} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-400">PROJECT NAME</label>
                <input required type="text" className="glass-input text-xs bg-slate-900/30 text-white" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-400">DESCRIPTION</label>
                <textarea className="glass-input text-xs h-20 resize-none bg-slate-900/30 text-white" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-400">CATEGORY</label>
                  <input type="text" className="glass-input text-xs bg-slate-900/30 text-white" value={category} onChange={(e) => setCategory(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-400">PRIORITY</label>
                  <select className="glass-input text-xs bg-slate-900/30 text-white cursor-pointer select-none" value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="Low" className="bg-[#0f0c1b]">Low</option>
                    <option value="Medium" className="bg-[#0f0c1b]">Medium</option>
                    <option value="High" className="bg-[#0f0c1b]">High</option>
                    <option value="Critical" className="bg-[#0f0c1b]">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-400">START DATE</label>
                  <input type="date" className="glass-input text-xs bg-slate-900/30 text-white cursor-pointer" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-400">END DATE</label>
                  <input type="date" className="glass-input text-xs bg-slate-900/30 text-white cursor-pointer" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-400">DEADLINE</label>
                  <input type="date" className="glass-input text-xs bg-slate-900/30 text-white cursor-pointer" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-400">TAGS (COMMA SEPARATED)</label>
                  <input type="text" className="glass-input text-xs bg-slate-900/30 text-white" value={tags} onChange={(e) => setTags(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-400">PROJECT STATUS</label>
                  <select className="glass-input text-xs bg-slate-900/30 text-white cursor-pointer select-none" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="Planning" className="bg-[#0f0c1b]">Planning</option>
                    <option value="Active" className="bg-[#0f0c1b]">Active</option>
                    <option value="On Hold" className="bg-[#0f0c1b]">On Hold</option>
                    <option value="Completed" className="bg-[#0f0c1b]">Completed</option>
                    <option value="Cancelled" className="bg-[#0f0c1b]">Cancelled</option>
                    <option value="Archived" className="bg-[#0f0c1b]">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-900/20 transition-all">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-white font-bold transition-all shadow-md shadow-brand-500/10">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
