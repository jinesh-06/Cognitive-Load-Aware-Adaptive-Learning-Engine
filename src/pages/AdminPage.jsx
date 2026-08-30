import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Cpu, 
  Database, 
  ShieldCheck, 
  UserPlus, 
  Users, 
  Mail, 
  Copy, 
  Check, 
  Trash2, 
  Sparkles, 
  Key, 
  ShieldAlert,
  Clock
} from 'lucide-react';
import { AnalyticsPage } from './AnalyticsPage.jsx';
import { ModelLabPage } from './ModelLabPage.jsx';
import { KnowledgeBasePage } from './KnowledgeBasePage.jsx';
import { fetchAdminTeam, createAdminInvite, revokeAdminInvite } from '../services/api.js';

export const AdminPage = ({ analytics, features, onResetSession, currentUser }) => {
  const [activeAdminTab, setActiveAdminTab] = useState('analytics');

  // Admin Team & Invitations State
  const [teamList, setTeamList] = useState([]);
  const [invitationsList, setInvitationsList] = useState([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);

  // New Invite Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('ML Research Lead');
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const [generatedInvite, setGeneratedInvite] = useState(null);
  const [copiedCode, setCopiedCode] = useState('');
  const [inviteFeedback, setInviteFeedback] = useState('');

  const tabs = [
    { id: 'analytics', label: 'Learner Analytics', icon: BarChart3 },
    { id: 'model', label: 'Model Studio', icon: Cpu },
    { id: 'knowledge', label: 'Knowledge Base', icon: Database },
    { id: 'team', label: 'Admin Team & Invites', icon: Users },
  ];

  // Load Admin Team & Invites
  const loadAdminData = async () => {
    setIsLoadingTeam(true);
    try {
      const data = await fetchAdminTeam();
      setTeamList(data.team || []);
      setInvitationsList(data.invitations || []);
    } catch (err) {
      console.warn('Failed to load admin data:', err);
    } finally {
      setIsLoadingTeam(false);
    }
  };

  useEffect(() => {
    if (activeAdminTab === 'team') {
      loadAdminData();
    }
  }, [activeAdminTab]);

  // Handle Create Invite
  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setIsSubmittingInvite(true);
    setInviteFeedback('');
    try {
      const res = await createAdminInvite({
        email: inviteEmail,
        name: inviteName || inviteEmail.split('@')[0],
        role: inviteRole,
        invitedBy: currentUser?.name || 'Dr. Sarah Chen'
      });

      setGeneratedInvite(res.invitation);
      setInviteFeedback(`Invitation created for ${inviteEmail}! Code: ${res.invitation.code}`);
      setInviteEmail('');
      setInviteName('');
      loadAdminData();
    } catch (err) {
      setInviteFeedback(err.message || 'Failed to create invite');
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  // Handle Revoke Invite
  const handleRevokeInvite = async (id) => {
    try {
      await revokeAdminInvite(id);
      setInvitationsList(prev => prev.filter(inv => inv.id !== id && inv.code !== id));
      if (generatedInvite?.id === id) setGeneratedInvite(null);
    } catch (err) {
      console.error('Revoke invite failed:', err);
    }
  };

  // Copy to clipboard
  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(type);
    setTimeout(() => setCopiedCode(''), 2000);
  };

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
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  Admin Control Portal
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Machine Learning Studio, Knowledge Vectors, Telemetry & Administrator Governance
              </p>
            </div>
          </div>

          {/* Admin Sub-Tab Navigation */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 backdrop-blur-sm overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeAdminTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveAdminTab(tab.id)}
                  id={`admin-tab-${tab.id}`}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
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

        {activeAdminTab === 'team' && (
          <div className="space-y-6" id="admin-team-section">
            
            {/* Top Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span>Active Administrators</span>
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{teamList.length || 2}</div>
                <p className="text-[11px] text-emerald-600 font-medium">Verified Admin IDs with full privileges</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span>Pending Invitations</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {invitationsList.filter(i => i.status === 'PENDING').length}
                </div>
                <p className="text-[11px] text-slate-400">Awaiting redemption by invited colleague</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span>Current Authenticated Admin</span>
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-sm font-bold text-slate-900 truncate">
                  {currentUser?.name || 'Dr. Sarah Chen'}
                </div>
                <p className="text-[11px] text-purple-600 font-semibold">{currentUser?.role || 'Super Administrator'}</p>
              </div>
            </div>

            {/* Invite New Admin Section */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-indigo-600" />
                    Invite Colleague as Administrator
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Generate an Admin ID credential and invitation code to grant full portal permissions to fellow faculty or researchers.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[11px] font-semibold rounded-full border border-indigo-200 self-start sm:self-auto">
                  Role-Based Authorization
                </span>
              </div>

              <form onSubmit={handleSendInvite} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Invitee Email Address *</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@university.edu"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Colleague Full Name</label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Prof. David Miller"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Assigned Admin Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none bg-white"
                  >
                    <option value="Super Administrator">Super Administrator (Full Access)</option>
                    <option value="ML Research Lead">ML Research Lead (Model Studio)</option>
                    <option value="Curriculum Admin">Curriculum Admin (Knowledge Base)</option>
                    <option value="Analytics Auditor">Analytics Auditor (Learner Telemetry)</option>
                  </select>
                </div>

                <div className="sm:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingInvite}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isSubmittingInvite ? 'Generating Invitation...' : 'Generate & Dispatch Invitation'}</span>
                  </button>
                </div>
              </form>

              {/* Feedback / Generated Invite Notification */}
              {generatedInvite && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Invitation Code Ready for {generatedInvite.email}
                    </span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">
                      ACTIVE CODE
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-emerald-300 font-mono font-bold text-emerald-900">
                      <Key className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{generatedInvite.code}</span>
                      <button
                        onClick={() => handleCopy(generatedInvite.code, 'gen-code')}
                        className="p-1 text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                        title="Copy Code"
                      >
                        {copiedCode === 'gen-code' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <button
                      onClick={() => handleCopy(`http://localhost:3000/?invite=${generatedInvite.code}`, 'gen-link')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      {copiedCode === 'gen-link' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Direct Invite Link</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Share this code or link with your colleague. When registering on the Login page, they can enter this invitation code to obtain instant <strong>{generatedInvite.role}</strong> access.
                  </p>
                </div>
              )}
            </div>

            {/* Pending Invitations Table */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                Pending Administrator Invitations
              </h3>

              {invitationsList.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No pending invitations.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                        <th className="pb-2.5">Invitee</th>
                        <th className="pb-2.5">Assigned Role</th>
                        <th className="pb-2.5">Invite Code</th>
                        <th className="pb-2.5">Invited By</th>
                        <th className="pb-2.5">Status</th>
                        <th className="pb-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {invitationsList.map((inv) => (
                        <tr key={inv.id || inv.code} className="hover:bg-slate-50/60">
                          <td className="py-3 font-medium">
                            <div className="font-semibold text-slate-900">{inv.name || inv.email}</div>
                            <div className="text-[11px] text-slate-400">{inv.email}</div>
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {inv.role}
                            </span>
                          </td>
                          <td className="py-3 font-mono font-semibold text-indigo-600">
                            {inv.code}
                          </td>
                          <td className="py-3 text-slate-500">{inv.invitedBy || 'Dr. Sarah Chen'}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              inv.status === 'ACCEPTED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3 text-right space-x-1">
                            <button
                              onClick={() => handleCopy(inv.code, inv.code)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                              title="Copy Code"
                            >
                              {copiedCode === inv.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleRevokeInvite(inv.id || inv.code)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Revoke Invitation"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Active Administrators Directory */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Active Administrator Directory
                </h3>
                <span className="text-xs text-slate-400">{teamList.length} Verified Admins</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamList.map((admin) => (
                  <div key={admin.id || admin.email} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                      {admin.name ? admin.name.slice(0, 2).toUpperCase() : 'AD'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm truncate">{admin.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          {admin.id || 'ADM-001'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{admin.email}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                        <span className="font-semibold text-indigo-700">{admin.role}</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          ACTIVE
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
