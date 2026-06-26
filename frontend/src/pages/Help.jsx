import React, { useState } from 'react';
import { HelpCircle, ChevronDown, CheckSquare, Brain, Key, Server } from 'lucide-react';

export const HelpGuide = () => {
  const [activeIdx, setActiveIdx] = useState(null);

  const guideChapters = [
    {
      title: 'Database Fallback Mechanics',
      icon: Server,
      desc: 'Nexora is configured to run on Sequelize ORM pointing at MySQL. If MySQL goes offline or has credentials errors, the application automatically pivots to an in-memory JSON file-based repository. All user records, workspaces, tasks, and chats are written to `backend/data/db.json` in real-time.'
    },
    {
      title: 'Integrated AI Workspace Assistant',
      icon: Brain,
      desc: 'Access advanced LLM capabilities inside task detail cards. You can trigger: (1) AI Task Description Writer which generates markdown specs; (2) AI Delay Risk Prediction which analyzes deadlines spillovers; (3) AI Priority Rating suggester which audits titles and descriptions.'
    },
    {
      title: 'Command Palette Keyboard Shortcuts',
      icon: Key,
      desc: 'Use the `Ctrl + K` or `Cmd + K` shortcuts anywhere on the screen to trigger the Command Palette. This modal accepts keyboard search queries to filter projects and tasks, switch visual themes, and quickly navigate workspace panels.'
    }
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-brand-500" />
          Help & User Guide
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">Understand the features, review fallback architectures, and learn shortcut keys.</p>
      </div>

      <div className="max-w-3xl flex flex-col gap-4">
        {guideChapters.map((ch, idx) => {
          const Icon = ch.icon;
          return (
            <div 
              key={idx}
              className="glass-panel border-white/20 p-5 flex flex-col gap-3"
            >
              <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-bold text-sm text-slate-200">{ch.title}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed leading-normal">{ch.desc}</p>
            </div>
          );
        })}
      </div>

    </div>
  );
};
