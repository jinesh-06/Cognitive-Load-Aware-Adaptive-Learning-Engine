import React from 'react';
import { Activity, BookOpen, Brain, HelpCircle, History, Info, ShieldCheck } from 'lucide-react';

export const Navbar = ({
  activeTab,
  setActiveTab,
  currentLoad,
  confidence,
  onOpenDisclaimer,
}) => {
  const getBadgeStyle = (load) => {
    switch (load) {
      case 'LOW':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20';
      case 'HIGH':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20 animate-pulse';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const navItems = [
    { id: 'home', label: 'Overview', icon: Activity },
    { id: 'reading', label: 'Lesson Reading', icon: BookOpen },
    { id: 'quiz', label: 'Checkpoint Quiz', icon: HelpCircle },
    { id: 'history', label: 'Quiz History', icon: History },
    { id: 'admin', label: 'Admin', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs" id="main-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base tracking-tight">Adaptive Learning Engine</span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Cognitive AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">Real-Time Telemetry & Pedagogical Scaffolding</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  id={`nav-tab-${item.id}`}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-3">
            {/* Cognitive Load Pill */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-2xs ring-2 ${getBadgeStyle(
                currentLoad
              )}`}
              id="navbar-load-indicator"
              title={`Cognitive Load: ${currentLoad} (${Math.round(confidence * 100)}% confidence)`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    currentLoad === 'LOW'
                      ? 'bg-emerald-400'
                      : currentLoad === 'MEDIUM'
                      ? 'bg-amber-400'
                      : 'bg-rose-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    currentLoad === 'LOW'
                      ? 'bg-emerald-600'
                      : currentLoad === 'MEDIUM'
                      ? 'bg-amber-600'
                      : 'bg-rose-600'
                  }`}
                />
              </span>
              <span className="tracking-wide">{currentLoad} LOAD</span>
              <span className="opacity-75 text-[10px]">({Math.round(confidence * 100)}%)</span>
            </div>

            {/* Academic Notes Button */}
            <button
              onClick={onOpenDisclaimer}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              title="Research Disclosure on Behavioral Proxies"
              id="btn-research-notes"
            >
              <Info className="w-4 h-4" />
            </button>

            {/* Student Profile Pill */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 text-xs text-slate-700">
              <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[11px]">
                AM
              </div>
              <span className="font-medium">Alex M.</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100 no-scrollbar">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
