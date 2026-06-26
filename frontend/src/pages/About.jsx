import React from 'react';
import { Info, Layers, Code, Briefcase, MessageSquare } from 'lucide-react';

export const AboutNexora = () => {
  return (
    <div className="flex flex-col gap-6 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Info className="w-6 h-6 text-brand-500" />
          About Nexora Workspace
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">Review the startup portal credentials, stack specifications, and development timelines.</p>
      </div>

      <div className="max-w-2xl glass-panel border-white/20 p-6 flex flex-col gap-5 text-xs text-slate-300 leading-relaxed">
        <div>
          <h3 className="font-bold text-sm text-white">Project Nesting Profile</h3>
          <p className="mt-1 leading-normal text-slate-400">
            **Nexora Workspace** is a production-ready software engineering portfolio SaaS prototype. It mimics the capabilities of monday.com, Linear, Notion, and ClickUp, focusing on glassmorphic design and real-time updates.
          </p>
        </div>

        <div className="border-t border-white/5 pt-4">
          <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-2">Technical Tech Stack Summary</h4>
          <ul className="list-disc pl-5 flex flex-col gap-1.5 text-slate-400">
            <li>**Frontend:** React 19, Vite, Tailwind CSS v3, Recharts, Framer Motion, Axios, Socket.io-client.</li>
            <li>**Backend:** Node.js, Express.js REST server, Socket.io WebSockets, Helmet header protections, Morgan logger.</li>
            <li>**Database ORM:** MySQL integration using Sequelize models with custom local-DB fallback failovers.</li>
          </ul>
        </div>

        <div className="border-t border-white/5 pt-4 flex gap-4 text-slate-500 font-bold">
          <a href="#" className="hover:text-slate-300 flex items-center gap-1.5">
            <Code className="w-4 h-4" /> GitHub Repository
          </a>
          <a href="#" className="hover:text-slate-300 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4" /> LinkedIn Profile
          </a>
        </div>
      </div>

    </div>
  );
};
