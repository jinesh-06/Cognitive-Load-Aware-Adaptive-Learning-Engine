import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  FileQuestion,
  GraduationCap,
  History,
  Layers,
  Lightbulb,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  X,
  XCircle,
  Zap
} from 'lucide-react';
import {
  CognitiveLoadState,
  ConceptExplanationResult,
  LessonTopic,
  QuestionAnalyticsItem,
  QuizAttempt,
  WeakQuestionAnalysis
} from '../types';
import {
  deleteQuizAttempt,
  explainWeakConcept,
  fetchQuizHistory,
  fetchWeakQuestionAnalysis
} from '../services/api';

interface Props {
  topics: LessonTopic[];
  currentLoad: CognitiveLoadState;
  confidence: number;
  onNavigateToQuiz: (topicId?: string) => void;
  onNavigateToReading: (topicId?: string) => void;
}

export const QuizHistoryPage: React.FC<Props> = ({
  topics,
  currentLoad,
  confidence,
  onNavigateToQuiz,
  onNavigateToReading
}) => {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [weakAnalysis, setWeakAnalysis] = useState<WeakQuestionAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(null);
  
  // Explanation state
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanationResult, setExplanationResult] = useState<ConceptExplanationResult | null>(null);
  const [explanationError, setExplanationError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'weak-areas' | 'progression'>('all');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [historyData, analysisData] = await Promise.all([
        fetchQuizHistory(),
        fetchWeakQuestionAnalysis(2)
      ]);
      setAttempts(historyData);
      setWeakAnalysis(analysisData);
    } catch (err) {
      console.error('Failed to load quiz history data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteAttempt = async (attemptId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this attempt record?')) {
      await deleteQuizAttempt(attemptId);
      if (selectedAttempt?.id === attemptId) {
        setSelectedAttempt(null);
      }
      loadData();
    }
  };

  const handleExplainConcept = async (questionItem?: QuestionAnalyticsItem | null) => {
    const targetQ = questionItem || weakAnalysis?.mostDifficultQuestion;
    if (!targetQ) return;

    setIsExplaining(true);
    setExplanationError(null);
    setExplanationResult(null);

    try {
      const result = await explainWeakConcept({
        questionId: targetQ.questionId,
        question: targetQ.question,
        userAnswer: targetQ.lastUserAnswer || 'Learner incorrect choice',
        correctAnswer: targetQ.correctAnswer || 'Correct theoretical principle',
        topic: targetQ.topicTitle,
        cognitiveLoad: currentLoad,
        conceptName: targetQ.relatedConcept
      });
      setExplanationResult(result);
    } catch (err: any) {
      console.error('Concept explanation failed:', err);
      setExplanationError(err.message || 'Could not generate explanation. Please try again.');
    } finally {
      setIsExplaining(false);
    }
  };

  // Quick stats calculation
  const totalCompleted = attempts.length;
  const avgAccuracy = totalCompleted > 0
    ? Math.round(attempts.reduce((acc, a) => acc + a.percentage, 0) / totalCompleted)
    : 0;
  const totalQuestionsAnswered = attempts.reduce((acc, a) => acc + a.total, 0);
  const totalCorrect = attempts.reduce((acc, a) => acc + a.score, 0);

  const mostDifficult = weakAnalysis?.mostDifficultQuestion;

  return (
    <div className="space-y-8 animate-fade-in pb-12" id="quiz-history-page">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <History className="w-3.5 h-3.5" />
              Quiz Performance & Weak-Question Diagnostics
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Quiz Attempt History & Cognitive Analysis
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every quiz attempt is logged and synthesized. The engine analyzes error rates across questions to identify weak conceptual areas and delivers adaptive scaffolding grounded in your live cognitive load state.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 text-center">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Attempts</span>
              <span className="text-xl font-bold text-white">{totalCompleted}</span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 text-center">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Avg Accuracy</span>
              <span className={`text-xl font-bold ${avgAccuracy >= 80 ? 'text-emerald-400' : avgAccuracy >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                {avgAccuracy}%
              </span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 text-center">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Questions</span>
              <span className="text-xl font-bold text-indigo-300">{totalQuestionsAnswered}</span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 text-center">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Active Load</span>
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 mt-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                <Brain className="w-3 h-3 text-indigo-400" />
                {currentLoad}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: WEAK QUESTION ANALYSIS (Highlighted Section) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6" id="weak-question-analysis-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/70 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Diagnostic Engine
            </div>
            <h2 className="text-xl font-bold text-slate-900">Your Most Challenging Question</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Evaluated across all historical quiz submissions (ranked by highest error rate with at least 2 attempts).
            </p>
          </div>

          <button
            onClick={() => loadData()}
            className="self-start sm:self-auto px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Analysis
          </button>
        </div>

        {weakAnalysis?.hasSufficientData && mostDifficult ? (
          <div className="bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-slate-50 border-2 border-amber-200/80 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-lg shadow-sm">
                  Highest Error Rate ({mostDifficult.errorPercentage}%)
                </span>
                <span className="px-3 py-1 bg-white border border-amber-200 text-amber-900 text-xs font-semibold rounded-lg">
                  Topic: {mostDifficult.topicTitle}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <Brain className="w-3.5 h-3.5 text-indigo-600" />
                Adaptive Scaffold Mode: <strong className="text-indigo-700">{currentLoad} Load</strong> ({Math.round(confidence * 100)}% conf)
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Challenging Question</p>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                "{mostDifficult.question}"
              </h3>
            </div>

            {/* Diagnostic Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-white/90 border border-amber-200/90 rounded-xl p-3.5 shadow-sm">
                <span className="text-[11px] font-semibold text-slate-500 block">Total Attempts</span>
                <span className="text-lg font-bold text-slate-900">{mostDifficult.totalAttempts} attempts</span>
              </div>
              <div className="bg-white/90 border border-rose-200/90 rounded-xl p-3.5 shadow-sm">
                <span className="text-[11px] font-semibold text-rose-600 block">Wrong Answers</span>
                <span className="text-lg font-bold text-rose-600">
                  {mostDifficult.wrongAttempts} / {mostDifficult.totalAttempts} ({mostDifficult.errorPercentage}%)
                </span>
              </div>
              <div className="bg-white/90 border border-indigo-200/90 rounded-xl p-3.5 shadow-sm">
                <span className="text-[11px] font-semibold text-indigo-600 block">Related Concept</span>
                <span className="text-sm font-bold text-indigo-900 truncate block">
                  {mostDifficult.relatedConcept}
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Pedagogical Recommendation:</span> Read an AI-adapted conceptual breakdown before retaking this checkpoint.
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleExplainConcept(mostDifficult)}
                  disabled={isExplaining}
                  id="btn-explain-concept"
                  className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 text-amber-300 ${isExplaining ? 'animate-spin' : ''}`} />
                  {isExplaining ? 'Synthesizing Adaptive Explanation...' : 'Explain This Concept'}
                </button>

                <button
                  onClick={() => onNavigateToReading(mostDifficult.topicId)}
                  className="px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  Review Topic Material
                </button>
              </div>
            </div>

            {/* Live Explanation Panel if generated */}
            {explanationResult && (
              <div className="mt-4 p-5 sm:p-6 bg-white border-2 border-indigo-200 rounded-2xl shadow-lg space-y-4 animate-fade-in" id="concept-explanation-card">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      Concept: {explanationResult.concept}
                    </span>
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-semibold rounded-lg">
                      Tailored for {explanationResult.cognitiveLoad} Cognitive Load
                    </span>
                  </div>
                  <button
                    onClick={() => setExplanationResult(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                    title="Close explanation"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 text-slate-800 text-sm">
                  <div>
                    <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
                      Simple Explanation
                    </h4>
                    <p className="text-slate-700 leading-relaxed bg-indigo-50/40 p-3 rounded-xl border border-indigo-100/80">
                      {explanationResult.explanation}
                    </p>
                  </div>

                  {explanationResult.analogy && (
                    <div>
                      <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        Real-World Analogy
                      </h4>
                      <p className="text-slate-700 italic bg-amber-50/50 p-3 rounded-xl border border-amber-200/60 leading-relaxed">
                        "{explanationResult.analogy}"
                      </p>
                    </div>
                  )}

                  {explanationResult.example && (
                    <div>
                      <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Concrete Example
                      </h4>
                      <p className="text-slate-700 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100/80 leading-relaxed">
                        {explanationResult.example}
                      </p>
                    </div>
                  )}

                  {explanationResult.stepByStep && explanationResult.stepByStep.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Step-by-Step Breakdown:
                      </h4>
                      <ul className="space-y-1.5 pl-2">
                        {explanationResult.stepByStep.map((step, sIdx) => (
                          <li key={sIdx} className="text-xs text-slate-600 flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {sIdx + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-2">
                    <div className="p-3 bg-slate-900 text-white rounded-xl text-xs space-y-1">
                      <span className="font-bold text-amber-300 block">Key Point to Remember:</span>
                      <p className="text-slate-200">{explanationResult.keyPoint}</p>
                    </div>
                  </div>

                  {explanationResult.ragSourcesUsed && explanationResult.ragSourcesUsed.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">RAG Context Grounding: </span>
                      {explanationResult.ragSourcesUsed.map((src, idx) => (
                        <span key={idx} className="inline-block mr-2 px-2 py-0.5 bg-slate-100 rounded text-slate-600 border border-slate-200">
                          {src.title} ({src.source})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {explanationError && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{explanationError}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mx-auto flex items-center justify-center">
              <FileQuestion className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Complete more quizzes to identify your most challenging concepts.
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              The diagnostic analyzer requires at least 2 attempts on a question to reliably distinguish systematic conceptual gaps from transient slips.
            </p>
            <button
              onClick={() => onNavigateToQuiz()}
              className="mt-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow transition-all inline-flex items-center gap-1.5"
            >
              Take a Checkpoint Quiz
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* SECTION 2: PROGRESS TRACKING & IMPROVEMENT TRAJECTORY */}
      {weakAnalysis?.conceptProgression && weakAnalysis.conceptProgression.accuracyHistory.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6" id="improvement-chart-section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/70 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                Cognitive Growth Curve
              </div>
              <h2 className="text-xl font-bold text-slate-900">Concept Improvement & Accuracy Trajectory</h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Tracking historical accuracy progression across successive attempts for <strong>{weakAnalysis.conceptProgression.concept}</strong>.
              </p>
            </div>

            {/* Improvement Badge */}
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Net Improvement</span>
                <span className={`text-base font-extrabold ${weakAnalysis.conceptProgression.improvementPercentage >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {weakAnalysis.conceptProgression.improvementPercentage >= 0 ? '+' : ''}{weakAnalysis.conceptProgression.improvementPercentage}%
                </span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Simple Responsive SVG Chart: Attempt Number vs Accuracy */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Attempt Number vs. Accuracy (%)</span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" /> Accuracy Score
              </span>
            </div>

            <div className="h-44 w-full flex items-end gap-3 sm:gap-6 pt-6 pb-2 px-4 border-b border-slate-200">
              {weakAnalysis.conceptProgression.accuracyHistory.map((item, idx) => {
                const heightPercent = Math.max(12, item.accuracy);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[11px] font-bold text-slate-700 opacity-80 group-hover:opacity-100 transition-opacity">
                      {item.accuracy}%
                    </span>
                    <div className="w-full max-w-[48px] bg-slate-200 rounded-t-xl overflow-hidden h-full flex items-end">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-xl transition-all duration-500 ${
                          item.accuracy >= 80
                            ? 'bg-emerald-500 group-hover:bg-emerald-400'
                            : item.accuracy >= 50
                            ? 'bg-indigo-500 group-hover:bg-indigo-400'
                            : 'bg-amber-500 group-hover:bg-amber-400'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 truncate w-full text-center">
                      Attempt #{item.attemptIndex}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Baseline: {weakAnalysis.conceptProgression.initialAccuracy}%</span>
              <span>Current Score: {weakAnalysis.conceptProgression.currentAccuracy}%</span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: ALL QUIZ ATTEMPTS LOG */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6" id="all-attempts-table-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">All Quiz Attempts</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Complete chronological audit trail of all topic checkpoints submitted.
            </p>
          </div>

          <div className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            {attempts.length} Total {attempts.length === 1 ? 'Attempt' : 'Attempts'} Saved
          </div>
        </div>

        {attempts.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
            <FileQuestion className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No quiz attempts recorded yet.</p>
            <p className="text-xs text-slate-500">Complete a checkpoint quiz to start building your diagnostic history.</p>
            <button
              onClick={() => onNavigateToQuiz()}
              className="mt-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-500 transition-colors"
            >
              Start First Quiz
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-3.5 px-4">Quiz Topic</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-center">Score</th>
                  <th className="py-3.5 px-4 text-center">Accuracy</th>
                  <th className="py-3.5 px-4 text-center">Time Taken</th>
                  <th className="py-3.5 px-4 text-center">Correct</th>
                  <th className="py-3.5 px-4 text-center">Wrong</th>
                  <th className="py-3.5 px-4 text-center">Cognitive Load</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attempts.map((attempt) => {
                  const wrongCount = attempt.total - attempt.score;
                  return (
                    <tr
                      key={attempt.id}
                      onClick={() => setSelectedAttempt(attempt)}
                      className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 group-hover:text-indigo-600">
                        {attempt.topic}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {attempt.date}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {attempt.score} / {attempt.total}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 font-bold rounded-lg text-[11px] ${
                            attempt.percentage >= 80
                              ? 'bg-emerald-100 text-emerald-800'
                              : attempt.percentage >= 60
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {attempt.percentage}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-500 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-emerald-600">
                        {attempt.score}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-rose-600">
                        {wrongCount}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold">
                          {attempt.cognitiveLoadAtSubmission}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedAttempt(attempt)}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-colors flex items-center gap-1"
                            title="View Question-by-Question Breakdown"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Details
                          </button>
                          <button
                            onClick={(e) => handleDeleteAttempt(attempt.id, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Delete attempt record"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: VIEW ATTEMPT DETAILS */}
      {selectedAttempt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in" id="attempt-details-modal">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold mb-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  Topic Checkpoint Details
                </div>
                <h3 className="text-xl font-bold text-white">{selectedAttempt.topic}</h3>
                <p className="text-xs text-slate-400">
                  Attempt on {selectedAttempt.date} • {selectedAttempt.score}/{selectedAttempt.total} Correct ({selectedAttempt.percentage}%) • Time: {selectedAttempt.timeTaken}s
                </p>
              </div>

              <button
                onClick={() => setSelectedAttempt(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Question-by-Question Breakdown ({selectedAttempt.questions.length} Questions)
                </h4>

                {selectedAttempt.questions.map((q, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border ${
                      q.isCorrect
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-rose-50/40 border-rose-200'
                    } space-y-3`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                            q.isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <h5 className="text-sm font-bold text-slate-900 leading-snug">{q.question}</h5>
                          {q.concept && (
                            <span className="text-[11px] text-slate-500 font-semibold">
                              Target Concept: {q.concept}
                            </span>
                          )}
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg shrink-0 flex items-center gap-1 ${
                          q.isCorrect
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {q.isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Correct
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Incorrect
                          </>
                        )}
                      </span>
                    </div>

                    {/* Answers Comparison */}
                    <div className="space-y-1.5 text-xs bg-white/90 p-3.5 rounded-xl border border-slate-200">
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-slate-500 shrink-0 w-28">Your Selection:</span>
                        <span className={`font-semibold ${q.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {q.selectedAnswer || 'Not recorded'}
                        </span>
                      </div>

                      {!q.isCorrect && (
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-slate-500 shrink-0 w-28">Correct Answer:</span>
                          <span className="font-bold text-emerald-700">
                            {q.correctAnswer}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="text-xs text-slate-600 bg-slate-100/70 p-3 rounded-xl">
                        <span className="font-bold text-slate-700">Explanation: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => {
                  setSelectedAttempt(null);
                  onNavigateToReading(selectedAttempt.topicId);
                }}
                className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Read Lesson Notes
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedAttempt(null);
                    onNavigateToQuiz(selectedAttempt.topicId);
                  }}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retake Checkpoint Quiz
                </button>
                <button
                  onClick={() => setSelectedAttempt(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
