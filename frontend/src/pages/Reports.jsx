import React, { useState, useEffect } from 'react';
import { BarChart3, FileSpreadsheet, FileText, Download, Check, Calendar, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';

export const Reports = () => {
  const { activeWorkspace } = useAuth();
  const { addToast } = useNotifications();

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!activeWorkspace) return;
      try {
        const res = await api.get(`/workspaces/${activeWorkspace.id}/analytics`);
        setStats(res.data.stats);
      } catch (err) {
        console.warn('Failed to load stats:', err.message);
      }
    };
    fetchStats();
  }, [activeWorkspace]);

  const handleCsvExport = () => {
    if (!activeWorkspace) return;
    const downloadUrl = `http://localhost:5000/api/reports/export?format=csv&workspaceId=${activeWorkspace.id}`;
    
    addToast('Export Triggered', 'Starting CSV file compiled download...', 'info');
    window.open(downloadUrl, '_blank');
  };

  const handlePdfPrint = () => {
    addToast('Print Ready', 'Opening document printer panel...', 'success');
    window.print(); // triggers system print dialog representing the clean CSS print target
  };

  return (
    <div className="flex flex-col gap-6 font-sans print:p-8 print:bg-white print:text-black">
      
      {/* Page Header (Hidden on printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-500" />
            Workspace Reports Console
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">Compile developer sprints, milestones velocities, and download excel logs.</p>
        </div>
      </div>

      {/* Reports Summary stats preview (Hidden on printing) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        
        {/* CSV/Excel download card */}
        <div className="p-6 glass-panel border-white/20 flex flex-col justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Microsoft Excel Spreadsheet</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Export all projects summaries, task milestones, priority ratings, and estimated sprint durations into a tabular .csv sheet.
              </p>
            </div>
          </div>
          <button
            onClick={handleCsvExport}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-102"
          >
            <Download className="w-4 h-4" /> Download Excel Sheet
          </button>
        </div>

        {/* CSV direct download card */}
        <div className="p-6 glass-panel border-white/20 flex flex-col justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">CSV Data Sheet</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Extract raw comma-separated lists of workspace tasks and developer logs. Ideal for database migrations or importing to Monday.com.
              </p>
            </div>
          </div>
          <button
            onClick={handleCsvExport}
            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-102"
          >
            <Download className="w-4 h-4" /> Download CSV Data
          </button>
        </div>

        {/* PDF generator card */}
        <div className="p-6 glass-panel border-white/20 flex flex-col justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Printable PDF Report</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Compile a styled PDF executive document containing completion percentages, workload ratings, and backlog parameters.
              </p>
            </div>
          </div>
          <button
            onClick={handlePdfPrint}
            className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-102"
          >
            <FileText className="w-4 h-4" /> Print PDF Summary
          </button>
        </div>

      </div>

      {/* PRINT TARGET: Styled workspace overview document */}
      <div className="p-8 glass-panel border-white/20 bg-[#120f26]/30 flex flex-col gap-6 print:border-none print:shadow-none print:bg-white">
        
        {/* Document Header */}
        <div className="flex justify-between items-start border-b border-slate-200/40 dark:border-slate-800/40 pb-4">
          <div>
            <span className="text-[10px] text-brand-500 font-bold uppercase tracking-wider print:text-indigo-600">NEXORA PLATFORM SUMMARY REPORT</span>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 print:text-black mt-1">
              Workspace Profile: {activeWorkspace?.name || 'Nexora Project Sprint'}
            </h2>
            <span className="text-[10px] text-slate-400">Compiled on: {new Date().toLocaleString()}</span>
          </div>

          <div className="hidden print:block text-right">
            <span className="block font-bold text-xs">Nexora Workspace Inc.</span>
            <span className="block text-[10px] text-slate-400">Plan. Collaborate. Deliver.</span>
          </div>
        </div>

        {/* Report summary content */}
        {stats ? (
          <div className="flex flex-col gap-6">
            
            {/* Summary statistics row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 border border-slate-200/20 dark:border-white/5 rounded-xl print:border-slate-200">
                <span className="block text-[10px] text-slate-400 font-semibold uppercase">Total Projects</span>
                <span className="text-xl font-bold text-slate-800 dark:text-slate-100 print:text-black mt-1 block">{stats.totalProjects}</span>
              </div>
              <div className="p-3 border border-slate-200/20 dark:border-white/5 rounded-xl print:border-slate-200">
                <span className="block text-[10px] text-slate-400 font-semibold uppercase">Total Sprint Tasks</span>
                <span className="text-xl font-bold text-slate-800 dark:text-slate-100 print:text-black mt-1 block">{stats.totalTasks}</span>
              </div>
              <div className="p-3 border border-slate-200/20 dark:border-white/5 rounded-xl print:border-slate-200">
                <span className="block text-[10px] text-slate-400 font-semibold uppercase">Tasks Completed</span>
                <span className="text-xl font-bold text-emerald-400 print:text-emerald-600 mt-1 block">{stats.completedTasks}</span>
              </div>
              <div className="p-3 border border-slate-200/20 dark:border-white/5 rounded-xl print:border-slate-200">
                <span className="block text-[10px] text-slate-400 font-semibold uppercase">Productivity Velocity</span>
                <span className="text-xl font-bold text-brand-500 print:text-indigo-600 mt-1 block">{stats.productivityScore}%</span>
              </div>
            </div>

            {/* Sprint Completion Ratios details */}
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 print:text-black border-b border-slate-200/10 pb-1 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-brand-500 print:text-indigo-600" />
                Sprint Completion Ratios
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed leading-normal">
                Out of **{stats.totalTasks}** sprint backlog tasks, **{stats.completedTasks}** are completed, **{stats.inProgressTasks}** are in active development, and **{stats.pendingTasks}** are pending. The overall workspace tasks completion rate sits at **{stats.taskCompletionRate}%**.
              </p>
            </div>

            {/* Overdue Alert banner */}
            {stats.overdueTasks > 0 && (
              <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-300 print:text-rose-700 print:border-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-500" />
                <span>
                  **Warning Alert:** There are **{stats.overdueTasks}** tasks that are overdue. Sprint manager intervention is recommended to allocate supports.
                </span>
              </div>
            )}

            {/* Signatures placeholder for printed report */}
            <div className="hidden print:flex justify-between items-center mt-12 pt-8 border-t border-slate-200 text-slate-500 text-xs">
              <div className="flex flex-col gap-1">
                <div className="w-32 border-b border-slate-400 h-8" />
                <span>Prepared by: {activeWorkspace?.ownerId === 1 ? 'Alex Carter' : 'Workspace Owner'}</span>
              </div>
              <div className="flex flex-col gap-1 text-right">
                <div className="w-32 border-b border-slate-400 h-8 ml-auto" />
                <span>Verified by Audit</span>
              </div>
            </div>

          </div>
        ) : (
          <div className="py-10 text-center text-xs text-slate-400">
            Fetching stats details...
          </div>
        )}

      </div>

    </div>
  );
};
