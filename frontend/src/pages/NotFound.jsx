import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#080512] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="aurora-bg">
        <div className="absolute top-[30%] left-[30%] w-[300px] h-[300px] bg-brand-500/10 rounded-full aurora-blob animate-aurora" />
      </div>

      <div className="max-w-md glass-panel p-8 border border-white/20 shadow-2xl relative z-10 flex flex-col items-center gap-5">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">404 Error</h1>
          <h2 className="text-lg font-bold text-slate-200 mt-1">Page Not Found</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            The resource you are looking for has been moved, renamed, or is currently unavailable. Verify the URL path.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all hover:scale-102 mt-2"
        >
          <ArrowLeft className="w-4.5 h-4.5" /> Return to Dashboard
        </Link>
      </div>

    </div>
  );
};
