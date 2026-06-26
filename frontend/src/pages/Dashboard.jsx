import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Folder, CheckSquare, Clock, AlertTriangle, Play, CheckCircle2, 
  Calendar, Zap, Activity, Users, PlusCircle, ArrowUpRight, 
  CloudSun, FileSpreadsheet, Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';

export const Dashboard = () => {
  const { user, activeWorkspace } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  
  // Simulated Widgets
  const [weather, setWeather] = useState({ temp: 72, condition: 'Sunny Intervals' });
  const [quote, setQuote] = useState('Productivity is never an accident. It is always the result of a commitment to excellence.');

  // 1. Time ticking clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch statistics, projects, and activities
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!activeWorkspace) return;
      setLoading(true);
      try {
        // Fetch stats
        const statsRes = await api.get(`/workspaces/${activeWorkspace.id}/analytics`);
        setStats(statsRes.data.stats);

        // Fetch projects
        const projRes = await api.get(`/projects?workspaceId=${activeWorkspace.id}`);
        setProjects(projRes.data.projects);

        // Fetch tasks
        const taskRes = await api.get(`/tasks?workspaceId=${activeWorkspace.id}`);
        const allTasks = taskRes.data.tasks;
        setTasks(allTasks);

        // Get activities for top tasks
        const recentLogs = [];
        const topTasks = allTasks.slice(0, 3);
        for (const t of topTasks) {
          try {
            const actRes = await api.get(`/tasks/${t.id}/activities`);
            recentLogs.push(...actRes.data.activities);
          } catch (e) {
            // ignore if no activity
          }
        }
        recentLogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentActivities(recentLogs.slice(0, 5));

        // Randomized quote widget seeder
        const quotes = [
          'Productivity is never an accident. It is always the result of a commitment to excellence.',
          'Focus on being productive instead of busy.',
          'The best way to predict the future is to create it.',
          'Efficiency is doing things right; effectiveness is doing the right things.',
          'Sprints are not won by speed, but by consistency.'
        ];
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

        // Weather Simulator
        const temps = [68, 72, 75, 78, 80];
        const conditions = ['Clear Sky', 'Sunny Intervals', 'Light Breezes', 'Scattered Clouds'];
        setWeather({
          temp: temps[Math.floor(Math.random() * temps.length)],
          condition: conditions[Math.floor(Math.random() * conditions.length)]
        });

      } catch (err) {
        console.error('Failed to load dashboard:', err.message);
        addToast('Dashboard Error', 'Failed to retrieve workspace statistics.', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [activeWorkspace]);

  if (loading || !stats) {
    return (
      <div className="h-full w-full flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold tracking-wider animate-pulse-slow">LOAD DASHBOARD STATS...</span>
        </div>
      </div>
    );
  }

  // Colors for Recharts Pie
  const COLORS = ['#8b5cf6', '#a855f7', '#c084fc', '#f43f5e', '#fbbf24'];

  const taskPieData = [
    { name: 'Completed', value: stats.completedTasks },
    { name: 'In Progress', value: stats.inProgressTasks },
    { name: 'Pending', value: stats.pendingTasks },
    { name: 'On Hold', value: stats.onHoldTasks }
  ].filter(d => d.value > 0);

  // Default fallback if no tasks
  if (taskPieData.length === 0) {
    taskPieData.push({ name: 'No Tasks', value: 1 });
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Dynamic Header Welcome Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-panel border-white/20">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            {activeWorkspace?.name || 'My Workspace'} Dashboard
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Current system clock: <span className="text-brand-500 font-bold">{currentTime}</span> | Date: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Weather widget */}
        <div className="flex items-center gap-3 bg-slate-100/50 dark:bg-white/5 px-4 py-2 border border-slate-200/40 dark:border-white/5 rounded-2xl shrink-0">
          <CloudSun className="w-5 h-5 text-amber-500 animate-pulse-slow" />
          <div>
            <span className="block font-bold text-xs text-slate-700 dark:text-slate-300">{weather.temp}°F</span>
            <span className="block text-[10px] text-slate-400">{weather.condition}</span>
          </div>
        </div>
      </div>

      {/* Grid statistics cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Productivity Card */}
        <div className="col-span-2 p-6 glass-panel border-brand-500/20 bg-brand-500/5 flex flex-col justify-between gap-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Productivity Score</span>
              <span className="text-3xl font-extrabold text-brand-500 mt-1 block">{stats.productivityScore}%</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 shadow-inner">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Computed by analyzing sprint task completions, item weights, and deadlines risk index. Keep the velocity up!
          </p>
        </div>

        {/* Total Projects */}
        <div className="p-6 glass-panel border-white/20 flex flex-col justify-between gap-4 hover:shadow-lg transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Workspace Projects</span>
              <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 block">{stats.totalProjects}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <Folder className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            Active: <span className="text-slate-800 dark:text-slate-200 font-semibold">{stats.activeProjects}</span> | Completed: <span className="text-slate-800 dark:text-slate-200 font-semibold">{stats.completedProjects}</span>
          </span>
        </div>

        {/* Total Tasks */}
        <div className="p-6 glass-panel border-white/20 flex flex-col justify-between gap-4 hover:shadow-lg transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Sprint Tasks</span>
              <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 block">{stats.totalTasks}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
            Overdue items: <span className="text-rose-500 font-bold">{stats.overdueTasks}</span>
          </span>
        </div>
      </div>

      {/* Grid of Task priorities and details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-white/5 bg-white/5 dark:bg-white/5 flex flex-col">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Pending</span>
          <span className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">{stats.pendingTasks}</span>
        </div>
        <div className="p-4 rounded-xl border border-white/5 bg-white/5 dark:bg-white/5 flex flex-col">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">In Progress</span>
          <span className="text-xl font-bold text-brand-500 mt-1">{stats.inProgressTasks}</span>
        </div>
        <div className="p-4 rounded-xl border border-white/5 bg-white/5 dark:bg-white/5 flex flex-col">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Completed</span>
          <span className="text-xl font-bold text-emerald-400 mt-1">{stats.completedTasks}</span>
        </div>
        <div className="p-4 rounded-xl border border-white/5 bg-rose-500/5 dark:bg-rose-500/5 flex flex-col">
          <span className="text-[10px] text-rose-400 font-bold uppercase flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Critical & High
          </span>
          <span className="text-xl font-bold text-rose-500 mt-1">{stats.criticalTasks + stats.highPriorityTasks}</span>
        </div>
      </div>

      {/* Recharts Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Completion Line Chart */}
        <div className="lg:col-span-2 p-6 glass-panel border-white/20 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-200/40 dark:border-slate-800/40 pb-2">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Weekly Progress Velocity</h3>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Line Chart analytics</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a225420" />
                <XAxis dataKey="name" stroke="#a0aec0" fontSize={11} />
                <YAxis stroke="#a0aec0" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f0c1b', borderColor: '#2e2557', borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="completed" stroke="#8b5cf6" activeDot={{ r: 8 }} strokeWidth={2} name="Tasks Closed" />
                <Line type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={1} strokeDasharray="5 5" name="Total Sprint Scope" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sprint Work Status Allocation Pie */}
        <div className="p-6 glass-panel border-white/20 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-200/40 dark:border-slate-800/40 pb-2">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Sprint Work Split</h3>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Pie Chart allocation</span>
          </div>
          <div className="h-64 flex flex-col items-center justify-center">
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {taskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f0c1b', borderColor: '#2e2557', borderRadius: '12px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Legend */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-[10px] text-slate-400 font-medium">
              {taskPieData.map((d, index) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span>{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Developers Workload Allocation Bar Chart */}
      <div className="p-6 glass-panel border-white/20 flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-slate-200/40 dark:border-slate-800/40 pb-2">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 font-sans flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-500" />
            Developer Workload Allocation
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Hours allocation per member</span>
        </div>
        
        {stats.workloadAnalytics && stats.workloadAnalytics.length > 0 ? (
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.workloadAnalytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a225410" />
                <XAxis dataKey="name" stroke="#a0aec0" fontSize={11} />
                <YAxis stroke="#a0aec0" fontSize={11} label={{ value: 'Hours Allocated', angle: -90, position: 'insideLeft', fontSize: 10, offset: 0, fill: '#7c8ba1' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f0c1b', borderColor: '#2e2557', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Assigned hours" maxBarSize={45}>
                  {stats.workloadAnalytics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-10 text-center text-xs text-slate-400">
            No developer task allocations found. Assign sprint tasks to view analytics maps.
          </div>
        )}
      </div>

      {/* Grid for Bottom listings: Deadlines & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Today's Tasks & Upcoming Deadlines */}
        <div className="p-6 glass-panel border-white/20 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-200/40 dark:border-slate-800/40 pb-2">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              Upcoming Sprints Deadlines
            </h3>
            <button onClick={() => navigate('/tasks')} className="text-[10px] text-brand-500 font-bold hover:underline">
              View Kanban Board
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {tasks.filter(t => t.status !== 'Completed' && t.deadline).slice(0, 4).map(t => (
              <div 
                key={t.id} 
                className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 rounded-xl flex items-center justify-between hover:border-brand-500/20 transition-all cursor-pointer"
                onClick={() => navigate('/tasks')}
              >
                <div className="overflow-hidden pr-2">
                  <span className="block font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">{t.title}</span>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 font-medium">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                      t.priority === 'Critical' ? 'bg-rose-500/10 text-rose-500' :
                      t.priority === 'High' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-slate-500/10 text-slate-400'
                    }`}>
                      {t.priority}
                    </span>
                    <span>Hours: {t.estimatedHours}</span>
                  </div>
                </div>
                
                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/5 px-2.5 py-1 rounded-full shrink-0">
                  Due: {t.deadline}
                </span>
              </div>
            ))}

            {tasks.filter(t => t.status !== 'Completed' && t.deadline).length === 0 && (
              <div className="py-10 text-center text-xs text-slate-400">
                No upcoming task deadlines found.
              </div>
            )}
          </div>
        </div>

        {/* Recent Workspace activity updates */}
        <div className="p-6 glass-panel border-white/20 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-200/40 dark:border-slate-800/40 pb-2">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Recent Activities Log
            </h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Real-time audit feeds</span>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto max-h-72">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex gap-3 text-xs leading-relaxed">
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/20 flex items-center justify-center text-[10px] font-bold text-brand-500 shrink-0 uppercase shadow-sm">
                  {act.user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-200 mr-1">{act.user?.name || 'Someone'}</span>
                  <span className="text-slate-400">{act.details}</span>
                  <span className="block text-[9px] text-slate-500 mt-0.5">{new Date(act.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}

            {recentActivities.length === 0 && (
              <div className="py-10 text-center text-xs text-slate-400">
                No recent task activity recorded yet.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Quote banner */}
      <div className="p-4 rounded-xl border border-white/5 bg-slate-900/10 flex items-center gap-3">
        <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
        <span className="text-[10px] text-slate-400 font-medium italic">
          " {quote} "
        </span>
      </div>

    </div>
  );
};
