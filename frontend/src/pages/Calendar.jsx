import React, { useState, useEffect } from 'react';
import { Calendar, Layers, ChevronLeft, ChevronRight, Clock, Plus, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';

export const CalendarView = () => {
  const { activeWorkspace } = useAuth();
  const { addToast } = useNotifications();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('calendar'); // calendar or timeline (Gantt)

  // Calendar states
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchCalendarData = async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    try {
      const taskRes = await api.get(`/tasks?workspaceId=${activeWorkspace.id}`);
      setTasks(taskRes.data.tasks);

      const projRes = await api.get(`/projects?workspaceId=${activeWorkspace.id}`);
      setProjects(projRes.data.projects);
    } catch (err) {
      addToast('Error', 'Failed to retrieve calendar schedules.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [activeWorkspace]);

  // Calendar logic helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Month stats compile
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Get first day of month index (0 = Sun, 1 = Mon...)
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Get number of days in month
  const totalDays = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  // Fill pad days for start of month
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  // Fill days
  for (let i = 1; i <= totalDays; i++) {
    calendarDays.push(i);
  }

  // Format single digit helper
  const pad = (n) => (n < 10 ? '0' + n : n);

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Header switches */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-panel border-white/20">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-brand-500" />
            Agenda Schedule & Timeline
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">Track sprint milestones, deadlines, and project Gantt durations.</p>
        </div>

        {/* View togglers */}
        <div className="flex bg-slate-100 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 p-1 rounded-xl w-fit self-end">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'calendar'
                ? 'bg-brand-500 text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Month Calendar
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'timeline'
                ? 'bg-brand-500 text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Gantt Timeline
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-lg bg-brand-500 animate-spin" />
        </div>
      ) : viewMode === 'calendar' ? (
        
        // MONTHLY CALENDAR GRID
        <div className="glass-panel border-white/20 p-6 flex flex-col gap-4">
          
          {/* Calendar month switcher header */}
          <div className="flex justify-between items-center border-b border-slate-200/40 dark:border-slate-800/40 pb-4">
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
              {monthName} {year}
            </h3>
            <div className="flex items-center gap-2">
              <button onClick={handlePrevMonth} className="p-2 border border-slate-700/50 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 border border-slate-700/50 hover:bg-white/5 rounded-lg text-xs font-bold text-slate-300">
                Today
              </button>
              <button onClick={handleNextMonth} className="p-2 border border-slate-700/50 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days labels */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Month numbers grid */}
          <div className="grid grid-cols-7 gap-2 min-h-[40vh]">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={idx} className="p-2 rounded-xl border border-transparent opacity-20" />;
              }

              // Compute date string matching DB format: YYYY-MM-DD
              const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
              // Filter due tasks on this date
              const dayTasks = tasks.filter(t => t.deadline === dateStr);

              return (
                <div 
                  key={idx} 
                  className="p-2 rounded-xl border border-slate-200/40 dark:border-white/5 bg-slate-100/30 dark:bg-white/5 flex flex-col justify-between gap-2 overflow-hidden hover:border-brand-500/30 transition-all min-h-[90px]"
                >
                  <span className="font-bold text-xs text-slate-400">{day}</span>
                  
                  {/* Task list tags inside calendar date box */}
                  <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
                    {dayTasks.map(t => (
                      <div 
                        key={t.id} 
                        className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold truncate border ${
                          t.status === 'Completed' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 line-through opacity-60' :
                          t.priority === 'Critical' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                          t.priority === 'High' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                          'bg-brand-500/10 border-brand-500/20 text-brand-400'
                        }`}
                        title={`${t.title} (${t.status})`}
                      >
                        {t.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      ) : (
        
        // GANTT TIMELINE OVERVIEW
        <div className="glass-panel border-white/20 p-6 flex flex-col gap-6">
          <div className="border-b border-slate-200/40 dark:border-slate-800/40 pb-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-500" /> Project Milestones timeline
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Horizontal schedules compiled directly from project start/end dates.</p>
          </div>

          <div className="flex flex-col gap-6">
            {projects.map((proj) => {
              // Simulated width/position parameters based on dates or mock margins
              const progress = proj.progress || 0;
              const start = proj.startDate || '2026-06-01';
              const end = proj.deadline || '2026-06-30';

              return (
                <div key={proj.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b border-slate-200/20 dark:border-white/5 pb-4">
                  
                  {/* Left Column: Project details */}
                  <div className="md:col-span-1">
                    <span className="block font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{proj.name}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{proj.category}</span>
                  </div>

                  {/* Right Column: Gantt Progress bar timeline visual */}
                  <div className="md:col-span-3 flex flex-col gap-2">
                    <div className="relative w-full bg-slate-200 dark:bg-slate-800 h-6 rounded-lg overflow-hidden border border-slate-300/20 dark:border-white/5 flex items-center">
                      
                      {/* Project duration span filler */}
                      <div 
                        className="h-full bg-gradient-to-r from-brand-500/20 to-indigo-500/25 border-r border-brand-500/30 flex items-center px-3"
                        style={{ width: '85%' }} // Simulated duration width
                      >
                        {/* Progress inside duration bar */}
                        <div 
                          className="absolute top-0 bottom-0 left-0 bg-brand-500/30 hover:bg-brand-500/40 transition-all duration-300"
                          style={{ width: `${progress * 0.85}%` }}
                        />
                        <span className="text-[9px] font-extrabold text-brand-400 z-10">{progress}% completed</span>
                      </div>

                    </div>
                    
                    {/* Time duration labels */}
                    <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold uppercase tracking-wide">
                      <span>Start: {start}</span>
                      <span>Target: {end}</span>
                    </div>
                  </div>

                </div>
              );
            })}

            {projects.length === 0 && (
              <div className="py-10 text-center text-xs text-slate-400">
                No projects found. Add projects to compile timelines.
              </div>
            )}
          </div>
        </div>

      )}

    </div>
  );
};
