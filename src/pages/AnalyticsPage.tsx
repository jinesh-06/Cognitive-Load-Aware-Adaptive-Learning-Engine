import React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Brain,
  CheckCircle2,
  Clock,
  Flame,
  History,
  RotateCcw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap
} from 'lucide-react';
import { BehavioralFeatures, CognitiveLoadState, LearnerAnalytics } from '../types';

interface Props {
  analytics: LearnerAnalytics | null;
  features: BehavioralFeatures;
  onResetSession: () => void;
}

export const AnalyticsPage: React.FC<Props> = ({ analytics, features, onResetSession }) => {
  if (!analytics) {
    return <div className="p-8 text-center text-slate-500">Loading analytics...</div>;
  }

  // Format Timeline data
  const loadChartData = (analytics.loadHistory || []).map((item, idx) => ({
    step: `Step ${idx + 1}`,
    loadValue: item.load === 'LOW' ? 1 : item.load === 'MEDIUM' ? 2 : 3,
    loadLabel: item.load,
    confidencePct: Math.round(item.confidence * 100),
    topic: item.topicId,
  }));

  // Format Radar data
  const radarData = [
    { metric: 'Dwell Time', value: Math.min(100, Math.round((features.time_per_page / 300) * 100)) },
    { metric: 'Re-reads', value: Math.min(100, features.number_of_re_reads * 20) },
    { metric: 'Backtracks', value: Math.min(100, features.backtracking_count * 25) },
    { metric: 'Hesitation', value: Math.min(100, Math.round((features.quiz_hesitation_time / 45) * 100)) },
    { metric: 'Quiz Accuracy', value: features.quiz_accuracy },
    { metric: 'Scroll Speed', value: Math.min(100, Math.round((features.scroll_speed / 500) * 100)) },
  ];

  const quizChartData = (analytics.quizHistory || []).map((q, idx) => ({
    quizNum: `Quiz ${idx + 1}`,
    score: q.score,
    hesitation: q.hesitationTime,
    topic: q.topicId,
  }));

  const formatMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12" id="analytics-page-container">
      {/* Header Profile Ribbon */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-indigo-500/20">
            AM
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">{analytics.studentName}</h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Session
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Current Lesson: <strong className="text-slate-800 uppercase">{analytics.currentLessonId}</strong> • Total Time: {formatMinutes(analytics.totalTimeSpentSeconds)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onResetSession}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            id="reset-analytics-session-btn"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Learner Telemetry
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Cognitive Load State</span>
            <Brain className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-black ${
                analytics.currentLoad === 'LOW'
                  ? 'text-emerald-600'
                  : analytics.currentLoad === 'MEDIUM'
                  ? 'text-amber-600'
                  : 'text-rose-600'
              }`}
            >
              {analytics.currentLoad}
            </span>
            <span className="text-xs text-slate-400 font-medium">({Math.round(analytics.currentConfidence * 100)}% conf)</span>
          </div>
          <p className="text-[11px] text-slate-500">Real-time Random Forest output</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Average Quiz Accuracy</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{analytics.averageQuizAccuracy}%</span>
            <span className="text-xs text-emerald-600 font-semibold">{analytics.quizHistory.length} Quizzes</span>
          </div>
          <p className="text-[11px] text-slate-500">Checkpoint mastery rate</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Scaffolding Adaptations</span>
            <Sparkles className="w-4 h-4 text-violet-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{analytics.adaptationHistory.length}</span>
            <span className="text-xs text-slate-400">Transformations</span>
          </div>
          <p className="text-[11px] text-slate-500">Dynamic AI Prompt Scaffolds</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Struggle Indicators</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{analytics.totalReReads}</span>
            <span className="text-xs text-slate-400">Re-reads • {analytics.totalBacktracks} Backtracks</span>
          </div>
          <p className="text-[11px] text-slate-500">Behavioral difficulty markers</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Cognitive Load Timeline Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Cognitive Load Progression Over Time
              </h2>
              <p className="text-xs text-slate-500">Estimated cognitive strain levels (1 = Low, 2 = Medium, 3 = High)</p>
            </div>
            <span className="text-[11px] px-2 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded-lg">
              Closed Loop Telemetry
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={loadChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="loadGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="step" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  domain={[0.5, 3.5]}
                  ticks={[1, 2, 3]}
                  tickFormatter={val => (val === 1 ? 'LOW' : val === 2 ? 'MED' : 'HIGH')}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                          <p className="font-bold">{data.step} ({data.topic})</p>
                          <p className="text-indigo-300">Load: <strong>{data.loadLabel}</strong></p>
                          <p className="text-slate-400">Confidence: {data.confidencePct}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="loadValue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#loadGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Behavioral Radar Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-600" />
              Behavioral Feature Distribution
            </h2>
            <p className="text-xs text-slate-500">Normalized radar of current interaction signals</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#475569' }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} />
                <Radar name="Signal" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Adaptation History Stream */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              Continuous Adaptation Audit Log
            </h2>
            <p className="text-xs text-slate-500">Chronological history of cognitive load shifts and RAG/LLM transformations</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {analytics.adaptationHistory.length} Events Logged
          </span>
        </div>

        {analytics.adaptationHistory.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No adaptations recorded yet. Head to the Learning tab to interact and trigger adaptations!
          </div>
        ) : (
          <div className="space-y-3">
            {analytics.adaptationHistory.map(evt => (
              <div key={evt.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{evt.topicTitle}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 font-mono text-[11px]">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{evt.adaptationSummary}</p>
                </div>

                <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Triggered State:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] border ${
                        evt.predictedLoad === 'LOW'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : evt.predictedLoad === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {evt.predictedLoad} LOAD ({Math.round(evt.confidence * 100)}%)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
