import React from 'react';
import { Activity, BookOpen, Brain, HelpCircle, History, Info, LogOut, ShieldCheck } from 'lucide-react';

export const Navbar = ({
  activeTab,
  setActiveTab,
  currentLoad,
  confidence,
  onOpenDisclaimer,
  currentUser,
  onLogout,
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

  const isAdmin = Boolean(
    currentUser?.role === 'Admin' ||
    currentUser?.isAdmin === true ||
    currentUser?.role?.toLowerCase().includes('admin') ||
    currentUser?.role?.toLowerCase().includes('instructor')
  );

  const baseNavItems = [
    { id: 'home', label: 'Overview', icon: Activity },
    { id: 'reading', label: 'Lesson Reading', icon: BookOpen },
    { id: 'quiz', label: 'Checkpoint Quiz', icon: HelpCircle },
    { id: 'history', label: 'Quiz History', icon: History },
  ];

  const navItems = isAdmin
    ? [...baseNavItems, { id: 'admin', label: 'Admin Portal', icon: ShieldCheck }]
    : baseNavItems;

  const getAvatarColor = (name, isAdminUser) => {
    if (isAdminUser) return 'bg-gradient-to-tr from-purple-600 to-indigo-600 ring-purple-400/30';
    if (!name) return 'bg-orange-600 ring-orange-400/30';
    const firstChar = name.trim().charAt(0).toUpperCase();
    const letterMap = {
      A: 'bg-red-600 ring-red-400/30',
      B: 'bg-pink-600 ring-pink-400/30',
      C: 'bg-purple-600 ring-purple-400/30',
      D: 'bg-indigo-700 ring-indigo-400/30',
      E: 'bg-indigo-600 ring-indigo-400/30',
      F: 'bg-blue-600 ring-blue-400/30',
      G: 'bg-cyan-600 ring-cyan-400/30',
      H: 'bg-teal-600 ring-teal-400/30',
      I: 'bg-teal-700 ring-teal-500/30',
      J: 'bg-orange-600 ring-orange-400/30',
      K: 'bg-amber-600 ring-amber-400/30',
      L: 'bg-emerald-600 ring-emerald-400/30',
      M: 'bg-emerald-700 ring-emerald-500/30',
      N: 'bg-teal-800 ring-teal-500/30',
      O: 'bg-cyan-700 ring-cyan-500/30',
      P: 'bg-sky-600 ring-sky-400/30',
      Q: 'bg-blue-700 ring-blue-500/30',
      R: 'bg-rose-600 ring-rose-400/30',
      S: 'bg-violet-600 ring-violet-400/30',
      T: 'bg-purple-700 ring-purple-500/30',
      U: 'bg-fuchsia-600 ring-fuchsia-400/30',
      V: 'bg-pink-700 ring-pink-500/30',
      W: 'bg-rose-700 ring-rose-500/30',
      X: 'bg-orange-700 ring-orange-500/30',
      Y: 'bg-amber-700 ring-amber-500/30',
      Z: 'bg-slate-700 ring-slate-500/30',
    };
    return letterMap[firstChar] || 'bg-orange-600 ring-orange-400/30';
  };

  const getInitial = (name) => {
    if (!name) return 'J';
    return name.trim().charAt(0).toUpperCase();
  };

  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    setImgError(false);
  }, [currentUser?.avatarUrl]);

  const userName = currentUser?.name || 'Alex Mercer';

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
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
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
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              title="Research Disclosure on Behavioral Proxies"
              id="btn-research-notes"
            >
              <Info className="w-4 h-4" />
            </button>

            {/* Student / Admin Profile Pill & Logout */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 text-xs text-slate-700">
              {currentUser?.avatarUrl && !imgError ? (
                <img
                  src={currentUser.avatarUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-7 h-7 rounded-full object-cover shadow-xs border border-slate-300 ring-1 ring-indigo-500/30"
                  title={currentUser?.email || userName}
                />
              ) : (
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs text-white ring-1 select-none ${getAvatarColor(
                    userName,
                    isAdmin
                  )}`}
                  title={currentUser?.email || userName}
                >
                  {getInitial(userName)}
                </div>
              )}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-900 leading-tight truncate max-w-[100px]" title={userName}>
                    {userName}
                  </span>
                  {isAdmin && (
                    <span className="px-1.5 py-0.2 bg-purple-100 text-purple-700 text-[9px] font-extrabold rounded tracking-wider border border-purple-200">
                      ADMIN
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 leading-tight">
                  {currentUser?.role || (isAdmin ? 'Administrator' : 'Learner')}
                </span>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="ml-1 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Sign Out to Login Page"
                  id="btn-navbar-logout"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100 no-scrollbar justify-between items-center">
          <div className="flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 cursor-pointer ${
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
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 shrink-0 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3 h-3" />
              Sign Out
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
