import React, { useState } from 'react';
import { Activity, ChevronDown, ChevronUp, RefreshCw, Zap } from 'lucide-react';

export const BehaviorTelemetryBar = ({
  features,
  onUpdateFeatures,
  onTriggerPrediction,
  currentLoad,
  confidence,
  isSimulated,
  setIsSimulated,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const applyPreset = (type) => {
    setIsSimulated(true);
    if (type === 'struggling') {
      onUpdateFeatures({
        time_per_page: 245,
        scroll_speed: 90,
        number_of_re_reads: 5,
        backtracking_count: 4,
        quiz_hesitation_time: 38,
        quiz_attempts: 3,
        quiz_accuracy: 40,
        session_duration: 1250,
      });
    } else if (type === 'comfortable') {
      onUpdateFeatures({
        time_per_page: 60,
        scroll_speed: 410,
        number_of_re_reads: 0,
        backtracking_count: 0,
        quiz_hesitation_time: 5,
        quiz_attempts: 1,
        quiz_accuracy: 95,
        session_duration: 380,
      });
    } else {
      onUpdateFeatures({
        time_per_page: 145,
        scroll_speed: 210,
        number_of_re_reads: 2,
        backtracking_count: 2,
        quiz_hesitation_time: 18,
        quiz_attempts: 2,
        quiz_accuracy: 72,
        session_duration: 720,
      });
    }
  };

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 shadow-md" id="behavioral-telemetry-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        {/* Main Bar Summary */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-indigo-400">
              <Activity className="w-4 h-4 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Behavioral Telemetry Engine</span>
            </div>
            <span className="h-4 w-px bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Mode:</span>
              <button
                onClick={() => setIsSimulated(!isSimulated)}
                id="toggle-sim-mode-btn"
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  isSimulated
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {isSimulated ? 'Simulation Sandbox' : 'Live Browser Tracking'}
              </button>
            </div>
          </div>

          {/* Key Metrics Quick Ribbon */}
          <div className="hidden md:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5" title="Page dwell time">
              <span className="text-slate-400">Dwell:</span>
              <span className="font-mono font-semibold text-slate-200">{features.time_per_page}s</span>
            </div>
            <div className="flex items-center gap-1.5" title="Re-reading earlier sections">
              <span className="text-slate-400">Re-reads:</span>
              <span className={`font-mono font-semibold ${features.number_of_re_reads >= 3 ? 'text-rose-400 font-bold' : 'text-slate-200'}`}>
                {features.number_of_re_reads}x
              </span>
            </div>
            <div className="flex items-center gap-1.5" title="Navigating back and forth">
              <span className="text-slate-400">Backtracks:</span>
              <span className="font-mono font-semibold text-slate-200">{features.backtracking_count}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Hesitation before answering quiz">
              <span className="text-slate-400">Hesitation:</span>
              <span className="font-mono font-semibold text-slate-200">{features.quiz_hesitation_time}s</span>
            </div>
            <div className="flex items-center gap-1.5" title="Historical quiz accuracy">
              <span className="text-slate-400">Accuracy:</span>
              <span className={`font-mono font-semibold ${features.quiz_accuracy < 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {features.quiz_accuracy}%
              </span>
            </div>
          </div>

          {/* Quick Presets & Expansion Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              <button
                onClick={() => applyPreset('struggling')}
                className="px-2 py-1 rounded text-[11px] font-medium text-rose-300 hover:bg-rose-950/50 hover:text-rose-200 transition-colors flex items-center gap-1"
                title="Simulate high cognitive strain"
                id="preset-struggling-btn"
              >
                <Zap className="w-3 h-3 text-rose-400" />
                Struggling Preset
              </button>
              <button
                onClick={() => applyPreset('moderate')}
                className="px-2 py-1 rounded text-[11px] font-medium text-amber-300 hover:bg-amber-950/50 hover:text-amber-200 transition-colors"
                id="preset-moderate-btn"
              >
                Moderate
              </button>
              <button
                onClick={() => applyPreset('comfortable')}
                className="px-2 py-1 rounded text-[11px] font-medium text-emerald-300 hover:bg-emerald-950/50 hover:text-emerald-200 transition-colors"
                id="preset-comfortable-btn"
              >
                Comfortable
              </button>
            </div>

            <button
              onClick={onTriggerPrediction}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition-all active:scale-95"
              id="recalculate-load-btn"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Recalculate Load
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-slate-400 hover:text-white rounded transition-colors"
              title={isExpanded ? 'Collapse controls' : 'Expand fine-tune sliders'}
              id="expand-telemetry-btn"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded Fine-Tuning Slider Controls */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs" id="telemetry-fine-tuning-grid">
            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Page Dwell Time</span>
                <span className="font-mono text-indigo-300">{features.time_per_page} sec</span>
              </div>
              <input
                type="range"
                min="10"
                max="400"
                value={features.time_per_page}
                onChange={e => {
                  setIsSimulated(true);
                  onUpdateFeatures({ time_per_page: Number(e.target.value) });
                }}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Re-read Count</span>
                <span className="font-mono text-indigo-300">{features.number_of_re_reads} times</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={features.number_of_re_reads}
                onChange={e => {
                  setIsSimulated(true);
                  onUpdateFeatures({ number_of_re_reads: Number(e.target.value) });
                }}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Backtracking Count</span>
                <span className="font-mono text-indigo-300">{features.backtracking_count} jumps</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                value={features.backtracking_count}
                onChange={e => {
                  setIsSimulated(true);
                  onUpdateFeatures({ backtracking_count: Number(e.target.value) });
                }}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Quiz Hesitation Time</span>
                <span className="font-mono text-indigo-300">{features.quiz_hesitation_time} sec</span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                value={features.quiz_hesitation_time}
                onChange={e => {
                  setIsSimulated(true);
                  onUpdateFeatures({ quiz_hesitation_time: Number(e.target.value) });
                }}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Scroll Velocity</span>
                <span className="font-mono text-indigo-300">{features.scroll_speed} px/s</span>
              </div>
              <input
                type="range"
                min="20"
                max="600"
                value={features.scroll_speed}
                onChange={e => {
                  setIsSimulated(true);
                  onUpdateFeatures({ scroll_speed: Number(e.target.value) });
                }}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Quiz Accuracy</span>
                <span className="font-mono text-indigo-300">{features.quiz_accuracy}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={features.quiz_accuracy}
                onChange={e => {
                  setIsSimulated(true);
                  onUpdateFeatures({ quiz_accuracy: Number(e.target.value) });
                }}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Quiz Attempts</span>
                <span className="font-mono text-indigo-300">{features.quiz_attempts} tries</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={features.quiz_attempts}
                onChange={e => {
                  setIsSimulated(true);
                  onUpdateFeatures({ quiz_attempts: Number(e.target.value) });
                }}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="flex items-end">
              <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700 w-full flex items-center justify-between">
                <span className="text-slate-400">Current Output:</span>
                <span className={`font-bold text-xs ${currentLoad === 'LOW' ? 'text-emerald-400' : currentLoad === 'MEDIUM' ? 'text-amber-400' : 'text-rose-400'}`}>
                  {currentLoad} LOAD ({Math.round(confidence * 100)}%)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
