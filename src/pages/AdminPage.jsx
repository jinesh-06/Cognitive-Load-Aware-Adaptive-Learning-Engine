import React, { useState } from 'react';
import { BarChart3, Cpu, Database, ShieldCheck } from 'lucide-react';
import { AnalyticsPage } from './AnalyticsPage.jsx';
import { ModelLabPage } from './ModelLabPage.jsx';
import { KnowledgeBasePage } from './KnowledgeBasePage.jsx';

export const AdminPage = ({ analytics, features, onResetSession }) => {
  const [activeAdminTab, setActiveAdminTab] = useState('analytics');

  const tabs = [
    { id: 'analytics', label: 'Learner Analytics', icon: BarChart3 },
    { id: 'model', label: 'Model Studio', icon: Cpu },
    { id: 'knowledge', label: 'Knowledge Base', icon: Database },
  ];

  return (
    <div className="space-y-6 pb-12" id="admin-page-container">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-72 h-72 bg-indigo-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-60 h-60 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Analytics, ML Model Management & Knowledge Base Administration
              </p>
            </div>
          </div>

          {/* Admin Sub-Tab Navigation */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 backdrop-blur-sm">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeAdminTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveAdminTab(tab.id)}
                  id={`admin-tab-${tab.id}`}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Admin Tab Content */}
      <div>
        {activeAdminTab === 'analytics' && (
          <AnalyticsPage
            analytics={analytics}
            features={features}
            onResetSession={onResetSession}
          />
        )}

        {activeAdminTab === 'model' && (
          <ModelLabPage />
        )}

        {activeAdminTab === 'knowledge' && (
          <KnowledgeBasePage />
        )}
      </div>
    </div>
  );
};
