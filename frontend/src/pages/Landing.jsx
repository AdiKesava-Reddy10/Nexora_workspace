import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Shield, Zap, Sparkles, Layers, 
  MessageSquare, BarChart, Users, ChevronDown, Check, Send 
} from 'lucide-react';

export const Landing = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [submittedNewsletter, setSubmittedNewsletter] = useState(false);

  const features = [
    { name: 'Multi-Workspace System', desc: 'Create segregated environments for separate companies, projects, or client sprints.', icon: Layers },
    { name: 'Kanban & Gantt Timelines', desc: 'Manage sprint lifecycles with drag-and-drop boards, Gantt timelines, and weekly agendas.', icon: Zap },
    { name: 'Real-time Synchronization', desc: 'Collaborate with teammates instantly via live Socket chat, status syncing, and online indicators.', icon: MessageSquare },
    { name: 'Contextual AI Assistant', desc: 'Autogenerate task scopes, analyze project delays, suggest priorities, and parse meeting minutes.', icon: Sparkles },
    { name: 'Excel & PDF Reports', desc: 'Export project metrics, developer workloads, and productivity sheets with a single click.', icon: BarChart },
    { name: 'Unified Security Core', desc: 'Keep assets secure with JWT tokens, sanitization filters, and robust role validations.', icon: Shield }
  ];

  const pricingPlans = [
    {
      name: 'Starter Workspace',
      price: '$0',
      period: 'Forever free',
      desc: 'Perfect for students, freelancers, and small squads testing features.',
      features: ['Up to 2 Workspaces', '10 Active Projects', 'Unlimited Kanban Tasks', 'Local JSON db Fallback', 'Standard Analytics'],
      cta: 'Start Free',
      popular: false
    },
    {
      name: 'Nexora Team Pro',
      price: '$9',
      period: 'per user / month',
      desc: 'Best for engineering cells and managers seeking AI tools and WebSockets.',
      features: ['Unlimited Workspaces', 'Unlimited Projects', 'Real-time WebSocket Sync', 'AI Assistant (Task Gen, Predictions)', 'Advanced reports (PDF/Excel exports)', 'Priority Support'],
      cta: 'Unlock Pro Plan',
      popular: true
    },
    {
      name: 'Enterprise Platform',
      price: '$29',
      period: 'per user / month',
      desc: 'For scaling companies requiring system audit logs and roles managers.',
      features: ['Everything in Pro Plan', 'System logs audit trails', 'Role Manager settings', 'Dedicated database instances', '99.9% uptime SLA guarantee', 'Custom AI fine-tuning'],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const faqs = [
    { q: 'How does the automatic database fallback work?', a: 'When Nexora Workspace boots up, it attempts to hook into a MySQL database. If the database is offline or credentials fail, the server automatically fails over to a local file-based database (db.json). The UI displays a warning banner but remains 100% operational with identical features!' },
    { q: 'What AI services are supported?', a: 'The portal supports automated task description writing, project summary briefs, deadline delay probability calculations, meeting minutes formatting, and keyword-based priority indexing. It wraps Gemini and OpenAI APIs, falling back to a local rules engine if keys are absent.' },
    { q: 'Does it support real-time team collaboration?', a: 'Yes! Using WebSockets (Socket.io), task card movements on the Kanban board, chat text, typing indicators, and user online presences are synchronized across all browser instances instantly.' }
  ];

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubmittedNewsletter(true);
      setNewsletterEmail('');
      setTimeout(() => setSubmittedNewsletter(false), 5000);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 bg-[#080512] relative overflow-hidden select-none font-sans">
      
      {/* Background Aurora Blobs */}
      <div className="aurora-bg">
        <div className="absolute top-[10%] left-[20%] w-[350px] h-[350px] bg-brand-500/10 rounded-full aurora-blob animate-aurora" />
        <div className="absolute bottom-[20%] right-[10%] w-[450px] h-[450px] bg-indigo-600/10 rounded-full aurora-blob animate-aurora" style={{ animationDelay: '-5s' }} />
        <div className="absolute top-[60%] left-[5%] w-[250px] h-[250px] bg-purple-600/10 rounded-full aurora-blob animate-aurora" style={{ animationDelay: '-10s' }} />
      </div>

      {/* Landing Navbar */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand-500/20">
            N
          </div>
          <div>
            <span className="font-bold text-white tracking-tight">Nexora</span>
            <span className="block text-[9px] text-brand-400 font-semibold tracking-widest uppercase -mt-1">Workspace</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link 
            to="/register" 
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-xl text-white font-semibold text-sm transition-all shadow-md shadow-brand-500/20 flex items-center gap-1.5 hover:scale-102"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 text-center flex flex-col items-center gap-8 relative z-10">
        
        {/* Banner Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-500/30 bg-brand-500/5 text-xs text-brand-400 font-medium animate-pulse-slow">
          <Sparkles className="w-3.5 h-3.5" />
          Introducing AI-Powered Platform Operations
        </div>

        {/* Header Heading */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
          Plan. Collaborate. Deliver.<br />
          <span className="bg-gradient-to-r from-brand-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            All-in-One Collaborative Workspace.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl font-medium leading-relaxed">
          Combine Jira, ClickUp, Notion, and Slack in a single glassmorphic workspace. Fuel your projects with integrated AI summaries, drag Kanban, and real-time Socket syncing.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link 
            to="/register" 
            className="px-6 py-3.5 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-xl shadow-brand-500/25 flex items-center gap-2 transition-all hover:scale-102"
          >
            Create Your Workspace <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            to="/login"
            className="px-6 py-3.5 border border-slate-700 hover:border-slate-500 bg-slate-900/30 hover:bg-slate-900/50 text-slate-300 hover:text-white font-bold rounded-xl transition-all"
          >
            Launch Live Demo
          </Link>
        </div>

        {/* Project Snapshot Preview Mockup */}
        <div className="w-full max-w-5xl mt-12 p-2 rounded-2xl border border-white/10 bg-slate-950/40 backdrop-blur-md shadow-2xl relative">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-slate-950/60 rounded-t-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-slate-500 font-bold ml-2">NEXORA SAAS APPLICATION INTERFACE PREVIEW</span>
          </div>
          <div className="p-4 bg-[#0a061a] rounded-b-xl flex flex-col gap-4">
            
            {/* Mock Dashboard Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border border-white/5 bg-white/5 text-left flex flex-col gap-1">
                <span className="text-xs text-slate-400 font-semibold">Active Workspace Health</span>
                <span className="text-2xl font-bold text-emerald-400">94.2%</span>
                <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[94%]" />
                </div>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-white/5 text-left flex flex-col gap-1">
                <span className="text-xs text-slate-400 font-semibold">Completed Milestones</span>
                <span className="text-2xl font-bold text-brand-400">12 / 16</span>
                <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                  <div className="bg-brand-500 h-full w-[75%]" />
                </div>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-white/5 text-left flex flex-col gap-1">
                <span className="text-xs text-slate-400 font-semibold">Active Socket.io Rooms</span>
                <span className="text-2xl font-bold text-cyan-400">8 Connected</span>
                <span className="text-[9px] text-slate-500 font-medium mt-2">Real-time collaboration active</span>
              </div>
            </div>

            {/* Mock Task Kanban view inside hero */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border border-white/5 p-3 rounded-xl bg-slate-900/20 text-left">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-white/5 pb-1">
                  <span>PENDING (2)</span>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex flex-col gap-1.5 shadow-sm">
                  <span className="text-[9px] text-brand-400 font-bold uppercase">UI Design</span>
                  <span className="font-semibold text-xs text-slate-200">Revamp dark-mode widgets</span>
                  <span className="text-[8px] text-slate-500">Assignee: Sarah Jenkins</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-white/5 pb-1">
                  <span>IN PROGRESS (1)</span>
                </div>
                <div className="p-3 bg-brand-500/5 rounded-lg border border-brand-500/20 flex flex-col gap-1.5 shadow-sm">
                  <span className="text-[9px] text-indigo-400 font-bold uppercase">Backend API</span>
                  <span className="font-semibold text-xs text-slate-200">Socket typing indicator rooms</span>
                  <span className="text-[8px] text-slate-400">Assignee: Devon Miller</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-white/5 pb-1">
                  <span>COMPLETED (3)</span>
                </div>
                <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20 flex flex-col gap-1.5 shadow-sm opacity-60">
                  <span className="text-[9px] text-emerald-400 font-bold uppercase">Database</span>
                  <span className="font-semibold text-xs text-slate-300 line-through">MySQL Graceful Fallback Mode</span>
                  <span className="text-[8px] text-slate-400">Assignee: Alex Carter</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* Feature Showcase Grid */}
      <section className="max-w-6xl mx-auto px-6 py-20 relative z-10 border-t border-slate-900">
        <div className="text-center flex flex-col items-center gap-3 mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white">Full-Suite SaaS Engineering Features</h2>
          <p className="text-slate-400 text-sm max-w-xl">Every button, route, and logic layer is fully built with state-of-the-art framework structures.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md shadow-sm transition-all hover:bg-white/10 hover:border-white/10 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shadow-inner">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-100">{f.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-16 relative z-10 border-t border-slate-900 text-center">
        <h2 className="text-3xl font-bold text-white mb-10">What Engineering Teams Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-left flex flex-col gap-3 relative">
            <span className="text-5xl text-brand-500/20 font-serif absolute -top-2 left-2">“</span>
            <p className="text-sm text-slate-300 leading-relaxed font-medium pl-4">
              Nexora changed how we execute sprints. The built-in database connection fallback gave us a rock-solid dev platform when staging servers crashed. The local AI predicted spillovers with surprising accuracy!
            </p>
            <div className="flex items-center gap-3 mt-4 border-t border-white/5 pt-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 font-bold flex items-center justify-center text-xs">M</div>
              <div>
                <span className="block text-xs font-bold text-slate-200">Marcus Chen</span>
                <span className="block text-[10px] text-slate-500">Principal Engineer, LinearSpace</span>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-left flex flex-col gap-3 relative">
            <span className="text-5xl text-brand-500/20 font-serif absolute -top-2 left-2">“</span>
            <p className="text-sm text-slate-300 leading-relaxed font-medium pl-4">
              The keyboard shortcuts (Ctrl+K) command palette feels as clean as Slack or Figma. Adding task lists, drag-and-drop Kanbans, and exporting workload reports in CSV/Excel has completely automated our scrum calls.
            </p>
            <div className="flex items-center gap-3 mt-4 border-t border-white/5 pt-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 font-bold flex items-center justify-center text-xs">H</div>
              <div>
                <span className="block text-xs font-bold text-slate-200">Helena Rostova</span>
                <span className="block text-[10px] text-slate-500">Agile Product Owner, MondaySoft</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-6xl mx-auto px-6 py-20 relative z-10 border-t border-slate-900">
        <div className="text-center flex flex-col items-center gap-3 mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white">SaaS Pricing Matrix</h2>
          <p className="text-slate-400 text-sm max-w-md">No hidden fees. Choose a template matching your workspace size.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, i) => (
            <div 
              key={i} 
              className={`p-6 rounded-3xl border flex flex-col gap-6 relative transition-all ${
                plan.popular 
                  ? 'bg-gradient-to-b from-[#191136] to-[#0d0722] border-brand-500/50 shadow-xl scale-[1.03]'
                  : 'bg-white/5 border-white/5 hover:border-slate-800'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 right-6 px-3 py-1 bg-brand-500 text-white text-[9px] font-bold tracking-wider uppercase rounded-full shadow-lg">
                  MOST POPULAR
                </span>
              )}
              <div>
                <h3 className="font-bold text-lg text-slate-200">{plan.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{plan.desc}</p>
              </div>

              <div className="flex items-baseline gap-1 border-b border-white/5 pb-4">
                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                <span className="text-xs text-slate-400 font-medium">{plan.period}</span>
              </div>

              <ul className="flex-1 flex flex-col gap-2.5">
                {plan.features.map((feat, index) => (
                  <li key={index} className="flex items-center gap-2.5 text-xs text-slate-300">
                    <Check className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className={`w-full py-2.5 rounded-xl font-bold text-xs text-center transition-all ${
                  plan.popular
                    ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg'
                    : 'border border-slate-700 hover:border-slate-500 text-slate-300 hover:bg-slate-900/20'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 relative z-10 border-t border-slate-900">
        <h2 className="text-3xl font-bold text-center text-white mb-10">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="rounded-xl border border-white/5 bg-white/5 backdrop-blur-md overflow-hidden transition-all"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left font-semibold text-slate-200 text-sm hover:text-white"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${activeFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form & Newsletter */}
      <section className="max-w-5xl mx-auto px-6 py-16 relative z-10 border-t border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">Stay In Sync</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Subscribe to the Nexora Sprint Digest to receive product insights, SaaS optimization notes, and updates on database integrations.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="flex gap-2 max-w-sm mt-2">
            <input
              required
              type="email"
              placeholder="name@email.com"
              className="glass-input text-xs w-full bg-white/5 text-white"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
            />
            <button
              type="submit"
              className="p-2.5 bg-brand-500 hover:bg-brand-600 rounded-lg text-white font-bold transition-all shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          {submittedNewsletter && (
            <span className="text-xs text-emerald-400 font-semibold animate-pulse-slow">
              Success! You have subscribed. Check your email shortly.
            </span>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-4">
          <h3 className="font-bold text-base text-slate-200">Submit Feedback</h3>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Name" className="glass-input text-xs bg-transparent" />
            <input type="email" placeholder="Email" className="glass-input text-xs bg-transparent" />
          </div>
          <textarea placeholder="Your message..." className="glass-input text-xs h-20 resize-none bg-transparent" />
          <button
            onClick={() => alert('Feedback submitted! Thank you.')}
            className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 rounded-lg text-white font-bold text-xs transition-all shadow-md"
          >
            Submit Message
          </button>
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="border-t border-slate-900 py-10 relative z-10 max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-slate-500 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-white font-bold text-xs">N</div>
          <span className="font-bold text-slate-400">Nexora Workspace</span>
        </div>
        <span>&copy; 2026 Nexora Platform Inc. All rights reserved.</span>
        <div className="flex gap-4">
          <Link to="/about" className="hover:underline hover:text-slate-400">About</Link>
          <Link to="/help" className="hover:underline hover:text-slate-400">Guide</Link>
          <a href="#" className="hover:underline hover:text-slate-400">Privacy Policy</a>
        </div>
      </footer>

    </div>
  );
};
