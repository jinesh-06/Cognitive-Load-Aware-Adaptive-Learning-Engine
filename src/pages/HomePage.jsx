import React from 'react';
import { ArrowRight, BookOpen, Brain, CheckCircle2, Cpu, Database, Layers, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';

export const HomePage = ({ onStartLearning, onOpenDisclaimer }) => {
  return (
    <div className="space-y-12 pb-16" id="home-page-container">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Adaptive Cognitive Learning Platform
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Cognitive Load-Aware <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-violet-300 to-pink-300">Adaptive Learning Engine</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Traditional digital curricula apply a static, one-size-fits-all pace. This engine continuously monitors interaction dynamics, predicts cognitive strain via an ensemble <strong>Random Forest Classifier</strong>, and dynamically calibrates educational explanations using <strong>Semantic Vector Retrieval</strong> and <strong>Generative Pedagogical Synthesis</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onStartLearning}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              id="hero-start-learning-btn"
            >
              Enter Adaptive Classroom
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenDisclaimer}
              className="px-5 py-3.5 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 text-sm font-medium rounded-xl transition-colors cursor-pointer"
              id="hero-view-research-btn"
            >
              Research Methodology Notes
            </button>
          </div>
        </div>
      </section>

      {/* Subdomain Tags */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Adaptive E-Learning', icon: Brain, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
          { label: 'Random Forest Ensemble', icon: Cpu, color: 'text-violet-600 bg-violet-50 border-violet-200' },
          { label: 'Cognitive Load Theory', icon: TrendingUp, color: 'text-amber-600 bg-amber-50 border-amber-200' },
          { label: 'Vector Knowledge Store', icon: Database, color: 'text-blue-600 bg-blue-50 border-blue-200' },
          { label: 'Generative Synthesis', icon: Sparkles, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
          { label: 'Continuous Feedback', icon: RefreshCw, color: 'text-rose-600 bg-rose-50 border-rose-200' },
        ].map((tag, idx) => {
          const Icon = tag.icon;
          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex items-center gap-2.5 ${tag.color}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-xs font-semibold leading-tight">{tag.label}</span>
            </div>
          );
        })}
      </section>

      {/* Architecture & Continuous Feedback Pipeline */}
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              End-to-End System Architecture & Feedback Loop
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time closed-loop pipeline from interaction signals to AI pedagogical transformation</p>
          </div>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-200 self-start sm:self-auto">
            Continuous Adaptive Cycle
          </span>
        </div>

        {/* Visual Pipeline Flow */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Behavior Telemetry</h3>
            <p className="text-xs text-slate-600">
              Captures dwell time, scroll velocity, reading reversals, backtracking navigation, and quiz hesitation time.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative">
            <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h3 className="font-bold text-slate-900 text-sm">ML Cognitive Classifier</h3>
            <p className="text-xs text-slate-600">
              Random Forest ensemble evaluates normalized feature vectors and predicts state: <strong>LOW</strong>, <strong>MEDIUM</strong>, or <strong>HIGH</strong> load with confidence.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Semantic Retrieval</h3>
            <p className="text-xs text-slate-600">
              Vector search queries indexed textbooks, research publications, and pedagogical knowledge chunks with cosine matching.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              04
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Adaptive Scaffolding</h3>
            <p className="text-xs text-slate-600">
              Generates tailored analogies, step-by-step guides, and simplified examples. Learner takes checkpoint quizzes, feeding back into Step 01.
            </p>
          </div>
        </div>
      </section>

      {/* The 3 Adaptive Scaffolding Tiers */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Pedagogical Scaffolding Framework</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg">
                LOW Cognitive Load
              </span>
              <span className="text-xs text-slate-400">High Capacity</span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">Rigor & Technical Depth</h3>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Provides in-depth mathematical formulations and formal proofs.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Explores architectural nuances, tensor mechanics, and edge cases.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Challenges the learner with comprehensive conceptual questions.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg">
                MEDIUM Cognitive Load
              </span>
              <span className="text-xs text-slate-400">Moderate Strain</span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">Simplified Explanation + Example</h3>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Replaces dense formulas with intuitive step-by-step descriptions.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Provides 1 concrete practical real-world scenario.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Reduces non-essential jargon while preserving conceptual integrity.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-lg">
                HIGH Cognitive Load
              </span>
              <span className="text-xs text-slate-400">Maximum Scaffolding</span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">Analogy + Decomposed Steps</h3>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>Deconstructs concept into 4 small, sequential bite-sized steps.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>Provides a memorable physical analogy (e.g. assembly line blame trace).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>Eliminates heavy math notation and introduces micro-checkpoints.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Pedagogical Case Study & Adaptive Trajectory */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Adaptive Trajectory: The Backpropagation Case Study
          </h2>
          <span className="text-xs text-slate-400">Standardized Scenario</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1.5">
            <span className="text-indigo-400 font-semibold uppercase text-[10px]">Phase 1: Baseline</span>
            <p className="font-bold text-white text-sm">Standard Deep Explanation</p>
            <p className="text-slate-400">Student begins lesson on Backpropagation with normal load baseline.</p>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1.5">
            <span className="text-rose-400 font-semibold uppercase text-[10px]">Phase 2: High Strain Detected</span>
            <p className="font-bold text-white text-sm">Dwell 240s, 5 Re-reads, 40% Accuracy</p>
            <p className="text-slate-400">Random Forest predicts HIGH load; system retrieves physical analogy; content simplifies automatically.</p>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1.5">
            <span className="text-emerald-400 font-semibold uppercase text-[10px]">Phase 3: Recovery</span>
            <p className="font-bold text-white text-sm">Dwell 75s, 0 Re-reads, 90% Accuracy</p>
            <p className="text-slate-400">Model detects recovery (LOW load) and seamlessly returns to advanced technical topics.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
