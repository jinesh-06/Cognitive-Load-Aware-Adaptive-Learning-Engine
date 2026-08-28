import React from 'react';
import { AlertTriangle, BookOpen, CheckCircle, Info, ShieldCheck, X } from 'lucide-react';

export const ResearchDisclaimerModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" id="research-disclaimer-backdrop">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200" id="research-disclaimer-modal">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Academic & Research Disclosure</h2>
              <p className="text-xs text-slate-500">Cognitive Load Estimation Methodology & Datasets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            id="close-disclaimer-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-sm text-slate-600 leading-relaxed">
          <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 text-sm">Proxy vs Ground-Truth Cognitive Load</h3>
              <p className="text-xs text-blue-800/90 mt-1">
                Standard public interaction datasets (e.g., MOOCCube, EdNet) record learner clickstreams and response logs, but do not contain direct neuro-physiological ground-truth cognitive load measurements.
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Operational Architecture & Methodology
            </h4>
            <p>
              This adaptive learning platform uses a <strong>validated proxy behavioral feature framework</strong> combined with a structured synthetic dataset (1,200 records with statistical Gaussian noise and multi-factor correlations). Signals include dwell time, scroll velocity, reading reversals, backtracking, hesitation, and retry attempts.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Research-Grade Requirements
            </h4>
            <p>
              In a peer-reviewed research setting, clinical cognitive load estimation requires:
            </p>
            <ul className="list-disc pl-5 mt-1.5 space-y-1 text-xs text-slate-600">
              <li>Standardized psychometric scales (e.g., NASA-TLX, Paas 9-point scale).</li>
              <li>Physiological sensors: EEG alpha/theta oscillations, fNIRS prefrontal oxygenation, or eye-tracking pupillometry.</li>
              <li>Dual-task secondary reaction paradigms to measure spare working memory capacity.</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
            <h4 className="font-semibold text-slate-900 text-xs flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-slate-700" />
              Not a Medical Diagnostic System
            </h4>
            <p className="text-xs text-slate-500">
              This engine is designed strictly as an educational scaffolding prototype for dynamic pedagogical personalization and computer science evaluation.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow transition-colors"
            id="acknowledge-disclaimer-btn"
          >
            I Understand & Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
