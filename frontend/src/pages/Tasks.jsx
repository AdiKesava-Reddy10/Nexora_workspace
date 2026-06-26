import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Plus, Search, Filter, ArrowUpDown, MoreVertical, 
  Trash2, Copy, Calendar, AlertCircle, Play, CheckCircle2, User, 
  Tag, Clock, Brain, MessageSquare, History, ListTodo, ShieldAlert 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';

export const Tasks = () => {
  const { activeWorkspace, user } = useAuth();
  const { socket, connected } = useSocket();
  const { addToast } = useNotifications();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [filterProject, setFilterProject] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterAssignee, setFilterAssignee] = useState('All');
  const [sortKey, setSortKey] = useState('newest');

  // Modals & Active card states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  
  // Comments, Subtasks, Activity Log inside detail modal
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [activities, setActivities] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // AI states in detail modal
  const [aiGeneratingDesc, setAiGeneratingDesc] = useState(false);
  const [aiPredictingDelay, setAiPredictingDelay] = useState(false);
  const [aiDelayResult, setAiDelayResult] = useState(null);
  const [aiPriorityResult, setAiPriorityResult] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState('Pending');
  const [priority, setPriority] = useState('Medium');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');

  // 1. Initial Loaders
  const loadData = async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    try {
      const projRes = await api.get(`/projects?workspaceId=${activeWorkspace.id}`);
      setProjects(projRes.data.projects);

      const memberRes = await api.get(`/workspaces/${activeWorkspace.id}/members`);
      setWorkspaceMembers(memberRes.data.members);

      const taskRes = await api.get(`/tasks?workspaceId=${activeWorkspace.id}`);
      setTasks(taskRes.data.tasks);
    } catch (err) {
      console.error(err);
      addToast('Error', 'Failed to retrieve tasks metadata.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeWorkspace]);

  // 2. WebSockets Listeners for Kanban board updates
  useEffect(() => {
    if (socket && connected) {
      const handleKanbanRefreshed = ({ taskId, targetStatus }) => {
        // Update local status of task dynamically
        setTasks((prev) =>
          prev.map((t) => (t.id === parseInt(taskId, 10) ? { ...t, status: targetStatus } : t))
        );
        
        // Refresh details modal if viewing that task
        if (activeTask && activeTask.id === parseInt(taskId, 10)) {
          setActiveTask((prev) => ({ ...prev, status: targetStatus }));
        }
      };

      const handleTaskRefreshed = () => {
        loadData();
      };

      socket.on('kanban_updated', handleKanbanRefreshed);
      socket.on('task_refreshed', handleTaskRefreshed);

      return () => {
        socket.off('kanban_updated', handleKanbanRefreshed);
        socket.off('task_refreshed', handleTaskRefreshed);
      };
    }
  }, [socket, connected, activeTask]);

  // 3. Task CRUD Handlers
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim() || !projectId) return;

    try {
      const payload = {
        title,
        description,
        projectId: parseInt(projectId, 10),
        status,
        priority,
        startDate: startDate || null,
        deadline: deadline || null,
        estimatedHours: parseFloat(estimatedHours || 0),
        assignedUserId: assignedUserId ? parseInt(assignedUserId, 10) : null,
        tags,
        notes
      };

      const res = await api.post('/tasks', payload);
      addToast('Success', 'Task created successfully.', 'success');
      
      // Emit socket notification
      if (socket && connected) {
        socket.emit('task_updated', { workspaceId: activeWorkspace.id, taskId: res.data.task.id, userId: user.id });
      }

      resetForm();
      setShowCreateModal(false);
      loadData();
    } catch (err) {
      addToast('Error', err.message || 'Failed to create task.', 'error');
    }
  };

  const handleUpdateTaskStatus = async (taskId, targetStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: targetStatus });
      
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t))
      );

      if (activeTask && activeTask.id === taskId) {
        setActiveTask((prev) => ({ ...prev, status: targetStatus }));
      }

      // Emit WS Kanban Change
      if (socket && connected) {
        socket.emit('update_kanban', {
          workspaceId: activeWorkspace.id,
          taskId,
          sourceStatus: tasks.find(t => t.id === taskId)?.status,
          targetStatus,
          userId: user.id
        });
      }
    } catch (err) {
      addToast('Error', 'Failed to update task status.', 'error');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      addToast('Success', 'Task deleted.', 'success');
      
      if (socket && connected) {
        socket.emit('task_updated', { workspaceId: activeWorkspace.id, taskId: id, userId: user.id });
      }

      setShowDetailModal(false);
      loadData();
    } catch (err) {
      addToast('Error', 'Failed to delete task.', 'error');
    }
  };

  const handleDuplicateTask = async (id) => {
    try {
      await api.post(`/tasks/${id}/duplicate`);
      addToast('Success', 'Task duplicated successfully.', 'success');
      loadData();
    } catch (err) {
      addToast('Error', 'Failed to duplicate task.', 'error');
    }
  };

  // 4. Modal Details Loading: Comments, Checklist, Activities
  const openDetailModal = async (task) => {
    setActiveTask(task);
    setShowDetailModal(true);
    setAiDelayResult(null);
    setAiPriorityResult(null);

    // Fetch comments
    try {
      const commRes = await api.get(`/tasks/${task.id}/comments`);
      setComments(commRes.data.comments);

      const actRes = await api.get(`/tasks/${task.id}/activities`);
      setActivities(actRes.data.activities);

      // Load subtasks (tasks whose parentTaskId references this ID)
      const allTasksRes = await api.get(`/tasks?workspaceId=${activeWorkspace.id}`);
      const list = allTasksRes.data.tasks.filter(t => t.parentTaskId === task.id);
      setSubtasks(list);
    } catch (e) {
      console.warn('Failed to load subcomponents inside modal:', e.message);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await api.post(`/tasks/${activeTask.id}/comments`, { commentText });
      setComments((prev) => [...prev, res.data.comment]);
      setCommentText('');
      
      // refresh activity
      const actRes = await api.get(`/tasks/${activeTask.id}/activities`);
      setActivities(actRes.data.activities);
    } catch (err) {
      addToast('Error', 'Failed to add comment.', 'error');
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    try {
      const res = await api.post('/tasks', {
        title: newSubtaskTitle,
        projectId: activeTask.projectId,
        parentTaskId: activeTask.id,
        creatorId: user.id
      });
      setSubtasks((prev) => [...prev, res.data.task]);
      setNewSubtaskTitle('');
      loadData();
    } catch (err) {
      addToast('Error', 'Failed to add subtask.', 'error');
    }
  };

  const handleToggleSubtask = async (subId, currentStatus) => {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    try {
      await api.put(`/tasks/${subId}`, { status: nextStatus });
      setSubtasks((prev) =>
        prev.map((s) => (s.id === subId ? { ...s, status: nextStatus } : s))
      );
      loadData();
    } catch (err) {
      addToast('Error', 'Failed to update subtask status.', 'error');
    }
  };

  // 5. AI Helpers Triggers
  const triggerAiDescription = async () => {
    setAiGeneratingDesc(true);
    try {
      const categoryName = projects.find(p => p.id === activeTask.projectId)?.category || 'General';
      const res = await api.post('/ai/task-description', {
        title: activeTask.title,
        category: categoryName
      });
      
      // Update task in database with the AI generated description
      const updated = await api.put(`/tasks/${activeTask.id}`, { description: res.data.description });
      setActiveTask(updated.data.task);
      addToast('Success', 'AI generated task description applied successfully.', 'success');
      loadData();
    } catch (err) {
      addToast('Error', 'AI Generator failed.', 'error');
    } finally {
      setAiGeneratingDesc(false);
    }
  };

  const triggerAiPriority = async () => {
    try {
      const res = await api.post('/ai/priority-recommend', {
        title: activeTask.title,
        description: activeTask.description
      });
      setAiPriorityResult(res.data.recommendation);
    } catch (err) {
      addToast('Error', 'Failed to suggest priority.', 'error');
    }
  };

  const triggerAiDelayPrediction = async () => {
    setAiPredictingDelay(true);
    try {
      // Calculate progress (completed/total subtasks or status completion)
      let progress = activeTask.status === 'Completed' ? 100 : activeTask.status === 'In Progress' ? 50 : 0;
      if (subtasks.length > 0) {
        const closed = subtasks.filter(s => s.status === 'Completed').length;
        progress = Math.round((closed / subtasks.length) * 100);
      }

      const res = await api.post('/ai/predict-deadline', {
        deadline: activeTask.deadline,
        progress
      });
      setAiDelayResult(res.data.prediction);
    } catch (err) {
      addToast('Error', 'Failed to predict deadline delay.', 'error');
    } finally {
      setAiPredictingDelay(false);
    }
  };

  // 6. Native HTML5 Drag and Drop events
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskIdStr = e.dataTransfer.getData('text/plain');
    if (taskIdStr) {
      const taskId = parseInt(taskIdStr, 10);
      handleUpdateTaskStatus(taskId, targetStatus);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setProjectId(projects[0]?.id || '');
    setStatus('Pending');
    setPriority('Medium');
    setStartDate('');
    setDeadline('');
    setEstimatedHours('');
    setAssignedUserId('');
    setTags('');
    setNotes('');
  };

  // 7. Filtering & Sorting
  const filteredTasks = tasks
    .filter((t) => {
      // Do not show subtasks as top level cards on the Kanban board!
      if (t.parentTaskId) return false;

      const matchesSearch = 
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(search.toLowerCase())) ||
        (t.tags && t.tags.toLowerCase().includes(search.toLowerCase()));

      const matchesProj = filterProject === 'All' || t.projectId === parseInt(filterProject, 10);
      const matchesPrior = filterPriority === 'All' || t.priority === filterPriority;
      
      let matchesAssignee = true;
      if (filterAssignee === 'Unassigned') {
        matchesAssignee = !t.assignedUserId;
      } else if (filterAssignee !== 'All') {
        matchesAssignee = t.assignedUserId === parseInt(filterAssignee, 10);
      }

      return matchesSearch && matchesProj && matchesPrior && matchesAssignee;
    })
    .sort((a, b) => {
      if (sortKey === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortKey === 'deadline') return new Date(a.deadline || '9999-12-31') - new Date(b.deadline || '9999-12-31');
      if (sortKey === 'priority') {
        const priorities = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        return (priorities[b.priority] || 0) - (priorities[a.priority] || 0);
      }
      if (sortKey === 'hours') return b.estimatedHours - a.estimatedHours;
      return 0;
    });

  const columns = ['Pending', 'In Progress', 'Completed'];

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-brand-500" />
            Sprint Task Board
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">Drag and drop cards, assign developer logs, and write markdown descriptions using AI.</p>
        </div>

        <button
          onClick={() => { resetForm(); setShowCreateModal(true); }}
          className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/20 w-fit"
        >
          <Plus className="w-4 h-4" /> Create Task
        </button>
      </div>

      {/* Control panel: Search / Project / Priority / Assignee */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 glass-panel border-white/20">
        
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search task title, tags..."
            className="glass-input pl-10 text-xs w-full bg-slate-900/30 text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Project filter */}
        <select
          className="glass-input text-xs w-full bg-slate-900/30 text-white select-none cursor-pointer"
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
        >
          <option value="All" className="bg-darkBg-900">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id} className="bg-darkBg-900">{p.name}</option>
          ))}
        </select>

        {/* Priority filter */}
        <select
          className="glass-input text-xs w-full bg-slate-900/30 text-white select-none cursor-pointer"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="All" className="bg-darkBg-900">All Priorities</option>
          <option value="Critical" className="bg-darkBg-900">Critical</option>
          <option value="High" className="bg-darkBg-900">High</option>
          <option value="Medium" className="bg-darkBg-900">Medium</option>
          <option value="Low" className="bg-darkBg-900">Low</option>
        </select>

        {/* Assignee filter */}
        <select
          className="glass-input text-xs w-full bg-slate-900/30 text-white select-none cursor-pointer"
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
        >
          <option value="All" className="bg-darkBg-900">All Assignees</option>
          <option value="Unassigned" className="bg-darkBg-900">Unassigned Only</option>
          {workspaceMembers.map((m) => (
            <option key={m.userId} value={m.userId} className="bg-darkBg-900">{m.user?.name}</option>
          ))}
        </select>

      </div>

      {/* Kanban Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-lg bg-brand-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter(t => t.status === col);
            const totalHours = colTasks.reduce((sum, t) => sum + parseFloat(t.estimatedHours || 0), 0);
            
            return (
              <div 
                key={col}
                className="flex flex-col gap-4 min-h-[50vh] p-4 glass-panel border-white/20 transition-all"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col)}
              >
                {/* Column header */}
                <div className="flex justify-between items-center border-b border-slate-200/40 dark:border-slate-800/40 pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      col === 'Pending' ? 'bg-slate-400' :
                      col === 'In Progress' ? 'bg-brand-500' :
                      'bg-emerald-500'
                    }`} />
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">{col}</span>
                    <span className="text-[10px] bg-slate-100 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 px-2 py-0.5 rounded text-slate-400 font-bold">
                      {colTasks.length}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">Hrs: {totalHours.toFixed(1)}</span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 flex flex-col gap-3">
                  {colTasks.map((t) => {
                    const assignedUser = workspaceMembers.find(m => m.userId === t.assignedUserId)?.user;
                    
                    return (
                      <div
                        key={t.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, t.id)}
                        onClick={() => openDetailModal(t)}
                        className="p-4 rounded-xl border border-white/25 dark:border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-glass hover:bg-white/60 dark:hover:bg-white/10 cursor-pointer flex flex-col gap-3 active:scale-98"
                      >
                        
                        {/* Title */}
                        <div>
                          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 leading-snug tracking-tight">
                            {t.title}
                          </h4>
                          {t.description && (
                            <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {t.description}
                            </p>
                          )}
                        </div>

                        {/* Tags list */}
                        {t.tags && (
                          <div className="flex flex-wrap gap-1">
                            {t.tags.split(',').map((tag, idx) => (
                              <span key={idx} className="text-[8px] bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded text-slate-400 font-bold uppercase">
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Cards Footer controls */}
                        <div className="flex items-center justify-between border-t border-slate-200/20 dark:border-white/5 pt-3 mt-1">
                          
                          {/* Assignee photo */}
                          <div className="flex items-center gap-1.5">
                            {assignedUser ? (
                              <img 
                                src={assignedUser.avatar} 
                                alt={assignedUser.name} 
                                className="w-5 h-5 rounded-full object-cover ring-1 ring-brand-500/20"
                                title={`Assignee: ${assignedUser.name}`}
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-400" title="Unassigned">
                                U
                              </div>
                            )}
                            <span className="text-[8px] font-bold text-slate-400 bg-slate-500/5 px-2 py-0.5 rounded uppercase">{t.priority}</span>
                          </div>

                          <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{t.estimatedHours}h</span>
                          </div>

                        </div>

                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div className="flex-1 flex items-center justify-center p-6 border border-dashed border-slate-200/20 dark:border-slate-800/40 rounded-xl text-[10px] text-slate-500 font-medium">
                      Drag tasks here
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL MODAL (AI Engine inside) */}
      {showDetailModal && activeTask && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl glass-panel p-6 border border-white/20 shadow-2xl flex flex-col gap-6 overflow-y-auto max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-white/5">
              <div className="overflow-hidden">
                <span className="text-[9px] font-extrabold uppercase text-brand-500 bg-brand-500/5 border border-brand-500/10 px-2 py-0.5 rounded-full">
                  Task ID #{activeTask.id}
                </span>
                <h3 className="font-bold text-lg text-white mt-1.5 tracking-tight leading-snug">
                  {activeTask.title}
                </h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleDuplicateTask(activeTask.id)} title="Clone Task" className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => handleDeleteTask(activeTask.id)} title="Delete Task" className="p-2 text-rose-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setShowDetailModal(false)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all font-bold">✕</button>
              </div>
            </div>

            {/* Modal Body: Split detail and comments */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
              
              {/* Left 2/3 details */}
              <div className="md:col-span-2 flex flex-col gap-5">
                
                {/* Description */}
                <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/5 bg-white/5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-400 uppercase tracking-wider">Scope / Description</span>
                    
                    {/* AI Write Description */}
                    <button
                      onClick={triggerAiDescription}
                      disabled={aiGeneratingDesc}
                      className="px-2.5 py-1 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 font-bold border border-brand-500/30 rounded-lg flex items-center gap-1 hover:scale-102 transition-all disabled:opacity-50"
                    >
                      <Brain className="w-3.5 h-3.5" />
                      {aiGeneratingDesc ? 'AI Writing...' : 'AI Scope Writer'}
                    </button>
                  </div>
                  
                  <div className="text-slate-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap mt-1 select-text">
                    {activeTask.description || (
                      <span className="text-slate-500 italic block">No detailed description has been registered for this task. Click the AI Scope Writer to compile one instantly!</span>
                    )}
                  </div>
                </div>

                {/* Subtasks checklist */}
                <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/5 bg-white/5">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider block">Subtasks Checklist</span>
                  
                  <div className="flex flex-col gap-2 mt-1">
                    {subtasks.map(sub => (
                      <label key={sub.id} className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded text-brand-500 border-slate-700 bg-slate-900 focus:ring-brand-500"
                          checked={sub.status === 'Completed'}
                          onChange={() => handleToggleSubtask(sub.id, sub.status)}
                        />
                        <span className={`text-slate-300 font-medium ${sub.status === 'Completed' ? 'line-through text-slate-500 font-normal' : ''}`}>
                          {sub.title}
                        </span>
                      </label>
                    ))}

                    <form onSubmit={handleAddSubtask} className="flex gap-2 mt-2">
                      <input
                        required
                        type="text"
                        placeholder="Add a checklist item..."
                        className="glass-input py-1.5 text-xs w-full bg-slate-900/30 text-white"
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 rounded-lg text-white font-bold transition-all shadow-md"
                      >
                        Add
                      </button>
                    </form>
                  </div>
                </div>

                {/* Comments interface */}
                <div className="flex flex-col gap-3">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-brand-400" />
                    Task Comments Board
                  </span>

                  <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                    {comments.map((comm) => (
                      <div key={comm.id} className="p-2.5 rounded-lg border border-slate-200/10 bg-[#16122d]/40 flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[10px] text-brand-500 uppercase shrink-0">
                          {comm.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden">
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-[10px] text-slate-200">{comm.user?.name || 'User'}</span>
                            <span className="text-[8px] text-slate-500">{new Date(comm.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed break-words">{comm.commentText}</p>
                        </div>
                      </div>
                    ))}
                    {comments.length === 0 && (
                      <span className="text-slate-500 italic block py-4 text-center">No comments added yet. Add a note to start dialogue!</span>
                    )}
                  </div>

                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input
                      required
                      type="text"
                      placeholder="Write a message to your team..."
                      className="glass-input text-xs w-full bg-slate-900/30 text-white"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg text-white font-bold transition-all shadow-md shadow-brand-500/20"
                    >
                      Send
                    </button>
                  </form>
                </div>

              </div>

              {/* Right 1/3 controls & AI tools */}
              <div className="flex flex-col gap-4 border-l border-slate-200/10 pl-0 md:pl-4">
                
                {/* Meta details list */}
                <div className="flex flex-col gap-2.5 pb-4 border-b border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Status</span>
                    <select
                      className="bg-transparent border border-slate-800 rounded px-2 py-1 text-slate-200 font-bold"
                      value={activeTask.status}
                      onChange={(e) => handleUpdateTaskStatus(activeTask.id, e.target.value)}
                    >
                      <option value="Pending" className="bg-[#0f0c1b]">Pending</option>
                      <option value="In Progress" className="bg-[#0f0c1b]">In Progress</option>
                      <option value="Completed" className="bg-[#0f0c1b]">Completed</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Priority</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      activeTask.priority === 'Critical' ? 'bg-rose-500/10 text-rose-500' :
                      activeTask.priority === 'High' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-slate-500/10 text-slate-400'
                    }`}>
                      {activeTask.priority}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Estimated</span>
                    <span className="font-bold">{activeTask.estimatedHours} hours</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Deadline</span>
                    <span className="font-bold text-rose-400">{activeTask.deadline || 'No deadline'}</span>
                  </div>
                </div>

                {/* AI Assistant Toolkit */}
                <div className="flex flex-col gap-3 p-4 rounded-xl border border-brand-500/10 bg-brand-500/5">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-brand-400" />
                    AI Workspace Assistant
                  </span>

                  {/* Priority Suggester */}
                  <button
                    onClick={triggerAiPriority}
                    className="w-full py-2 border border-brand-500/20 hover:border-brand-500/40 bg-[#140f2f] hover:bg-[#1f193f] rounded-lg text-brand-400 font-bold text-left px-3 flex items-center gap-2 transition-all hover:scale-102"
                  >
                    <Plus className="w-3.5 h-3.5" /> Suggest Priority Rating
                  </button>
                  {aiPriorityResult && (
                    <div className="p-2.5 rounded-lg border border-slate-700 bg-slate-900 text-[10px] flex flex-col gap-1">
                      <div className="flex justify-between font-bold">
                        <span>AI Suggestion:</span>
                        <span className="text-brand-400">{aiPriorityResult.priority}</span>
                      </div>
                      <p className="text-slate-400 leading-normal">{aiPriorityResult.reasoning}</p>
                    </div>
                  )}

                  {/* Delay Risk Forecast */}
                  <button
                    onClick={triggerAiDelayPrediction}
                    disabled={aiPredictingDelay}
                    className="w-full py-2 border border-brand-500/20 hover:border-brand-500/40 bg-[#140f2f] hover:bg-[#1f193f] rounded-lg text-brand-400 font-bold text-left px-3 flex items-center gap-2 transition-all hover:scale-102 disabled:opacity-50"
                  >
                    <Clock className="w-3.5 h-3.5" /> Delay Risk Forecast
                  </button>
                  {aiDelayResult && (
                    <div className="p-2.5 rounded-lg border border-slate-700 bg-slate-900 text-[10px] flex flex-col gap-1">
                      <div className="flex justify-between font-bold">
                        <span>Risk Factor:</span>
                        <span className={
                          aiDelayResult.riskLevel === 'Critical' || aiDelayResult.riskLevel === 'High' ? 'text-rose-500' : 'text-emerald-400'
                        }>{aiDelayResult.riskLevel} ({aiDelayResult.probability}% probability)</span>
                      </div>
                      <p className="text-slate-400 leading-normal">{aiDelayResult.insight}</p>
                    </div>
                  )}

                </div>

                {/* Audit Activity Log */}
                <div className="flex flex-col gap-2">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                    <History className="w-4 h-4 text-slate-500" />
                    Audit Logs (Latest 3)
                  </span>

                  <div className="flex flex-col gap-2 overflow-y-auto max-h-36 pr-1 text-[10px] leading-relaxed">
                    {activities.slice(0, 3).map((act) => (
                      <div key={act.id} className="p-2 rounded bg-white/5 border border-white/5">
                        <span className="text-slate-400">{act.details}</span>
                        <span className="block text-[8px] text-slate-500 mt-0.5">{new Date(act.createdAt).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 border border-white/20 shadow-2xl flex flex-col gap-4 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-brand-500" /> Create Task Details
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            <form onSubmit={handleCreateTask} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-400">TASK TITLE</label>
                <input required type="text" placeholder="e.g. Establish express http router hooks" className="glass-input text-xs bg-slate-900/30 text-white" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-400">DESCRIPTION</label>
                <textarea placeholder="Write a summary..." className="glass-input text-xs h-20 resize-none bg-slate-900/30 text-white" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-400">TARGET PROJECT</label>
                  <select required className="glass-input text-xs bg-slate-900/30 text-white cursor-pointer select-none" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                    <option value="" disabled>Select target project...</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#0f0c1b]">{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-400">ASSIGNEE DEVELOPER</label>
                  <select className="glass-input text-xs bg-slate-900/30 text-white cursor-pointer select-none" value={assignedUserId} onChange={(e) => setAssignedUserId(e.target.value)}>
                    <option value="">Unassigned</option>
                    {workspaceMembers.map((m) => (
                      <option key={m.userId} value={m.userId} className="bg-[#0f0c1b]">{m.user?.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-400">ESTIMATED HOURS</label>
                  <input type="number" step="0.1" placeholder="8" className="glass-input text-xs bg-slate-900/30 text-white" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-400">START DATE</label>
                  <input type="date" className="glass-input text-xs bg-slate-900/30 text-white cursor-pointer" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-400">DEADLINE</label>
                  <input type="date" className="glass-input text-xs bg-slate-900/30 text-white cursor-pointer" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-400">TAGS (COMMA SEPARATED)</label>
                  <input type="text" placeholder="Backend, Express, Sockets" className="glass-input text-xs bg-slate-900/30 text-white" value={tags} onChange={(e) => setTags(e.target.value)} />
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

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-900/20 transition-all">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg text-white font-bold transition-all shadow-md shadow-brand-500/20">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
