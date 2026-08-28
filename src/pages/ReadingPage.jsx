import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  ArrowRight,
  BookOpen,
  Database,
  HelpCircle,
  Lightbulb,
  ListOrdered,
  RefreshCw,
  Sparkles,
  Zap,
  CheckCircle
} from 'lucide-react';
import { generateAdaptedContent } from '../services/api.js';

export const ReadingPage = ({
  topics,
  currentTopic,
  onSelectTopic,
  currentLoad,
  confidence,
  features,
  onForceLoad,
  onNavigateToQuiz,
}) => {
  const [viewMode, setViewMode] = useState('adapted');
  const [adaptedContent, setAdaptedContent] = useState(null);
  const [ragSources, setRagSources] = useState([]);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // Fetch or regenerate adapted content whenever topic or cognitive load state changes
  useEffect(() => {
    let isCancelled = false;
    async function loadContent() {
      setIsLoadingContent(true);
      try {
        const result = await generateAdaptedContent(
          currentTopic.id,
          currentLoad,
          confidence,
          currentLoad === 'HIGH' ? 1 : 0,
          features
        );
        if (!isCancelled) {
          setAdaptedContent(result.adaptedContent);
          setRagSources(result.ragSources || []);
        }
      } catch (err) {
        console.error('Failed to load adapted content:', err);
      } finally {
        if (!isCancelled) {
          setIsLoadingContent(false);
        }
      }
    }

    loadContent();

    return () => {
      isCancelled = true;
    };
  }, [currentTopic.id, currentLoad]);

  const getLoadBadgeColor = (load) => {
    switch (load) {
      case 'LOW':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'HIGH':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8" id="reading-page-container">
      {/* Top Topic Navigation & Selector */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Machine Learning Curriculum Modules
            </h2>
            <p className="text-xs text-slate-500">Select a topic to study with dynamic real-time cognitive scaffolding</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">{topics.length} Concepts Available</span>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar" id="topic-selector-strip">
          {topics.map(topic => {
            const isSelected = topic.id === currentTopic.id;
            return (
              <button
                key={topic.id}
                onClick={() => onSelectTopic(topic)}
                id={`topic-btn-${topic.id}`}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all text-left flex flex-col gap-0.5 border cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>{topic.title}</span>
                <span className={`text-[10px] font-normal ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {topic.category} • {topic.difficulty}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Re-read notification badge if active */}
      {features.number_of_re_reads > 0 && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3.5 px-4 text-amber-900 text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <RefreshCw className="w-4 h-4 text-amber-600 shrink-0" />
            <p>
              <strong className="font-semibold text-amber-950">Re-reading Session Active:</strong> You have initiated{' '}
              <span className="inline-flex items-center px-2 py-0.5 rounded-full font-bold bg-amber-200 text-amber-900">
                {features.number_of_re_reads} Re-read{features.number_of_re_reads > 1 ? 's' : ''}
              </span>{' '}
              from the quiz. Telemetry is logging your concept review.
            </p>
          </div>
          <button
            onClick={onNavigateToQuiz}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
          >
            Return to Quiz
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Cognitive Load Scaffolding Diagnostic Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Dynamic Adaptation Engine</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-300">Target: {currentTopic.title}</span>
          </div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
            <span>Pedagogical Mode:</span>
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${getLoadBadgeColor(currentLoad)}`}>
              {currentLoad} COGNITIVE LOAD
            </span>
            <span className="text-xs text-slate-400 font-normal">({Math.round(confidence * 100)}% ML confidence)</span>
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl">
            {currentLoad === 'LOW' && 'High comprehension capacity detected. Delivering rigorous mathematical formulations, formal proofs, and deep mechanics.'}
            {currentLoad === 'MEDIUM' && 'Moderate cognitive strain detected. Simplifying notation and inserting 1 concrete practical example.'}
            {currentLoad === 'HIGH' && 'High cognitive strain detected! Decomposing into 4 bite-sized steps with intuitive real-world analogy.'}
          </p>
        </div>

        {/* Quick Scaffolding Override Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Force Scaffolding:</span>
          <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => onForceLoad('LOW')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                currentLoad === 'LOW' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
              id="force-low-btn"
            >
              Low
            </button>
            <button
              onClick={() => onForceLoad('MEDIUM')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                currentLoad === 'MEDIUM' ? 'bg-amber-600 text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
              id="force-medium-btn"
            >
              Medium
            </button>
            <button
              onClick={() => onForceLoad('HIGH')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                currentLoad === 'HIGH' ? 'bg-rose-600 text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
              id="force-high-btn"
            >
              High
            </button>
          </div>
        </div>
      </div>

      {/* Main Study Content Area */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6" id="lesson-content-card">
          {/* View Mode Toggle */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('adapted')}
                id="tab-adapted-view"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'adapted'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Dynamic Adapted Explanation ({currentLoad} Load)
              </button>
              <button
                onClick={() => setViewMode('original')}
                id="tab-original-view"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'original'
                    ? 'bg-slate-100 text-slate-800 border border-slate-300 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                Standard Curriculum Definition
              </button>
            </div>

            {adaptedContent && (
              <span className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1">
                Synthesized by: <strong className="text-slate-600">{adaptedContent.generatedBy}</strong>
              </span>
            )}
          </div>

          {/* Content Body */}
          {isLoadingContent ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-sm font-medium">Retrieving reference context & synthesizing pedagogical scaffolding...</p>
            </div>
          ) : viewMode === 'adapted' && adaptedContent ? (
            <div className="space-y-6 text-slate-800">
              {/* Title & Summary */}
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{adaptedContent.title}</h1>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  {adaptedContent.summary}
                </p>
              </div>

              {/* Intuitive Analogy Box (For HIGH & MEDIUM cognitive loads) */}
              {adaptedContent.analogy && (
                <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2" id="analogy-card">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    Intuitive Real-World Analogy (Cognitive Load Reducer)
                  </div>
                  <p className="text-sm text-amber-950 font-medium leading-relaxed italic">
                    "{adaptedContent.analogy}"
                  </p>
                </div>
              )}

              {/* Step-by-Step Breakdown (For HIGH Cognitive Load) */}
              {adaptedContent.stepByStep && adaptedContent.stepByStep.length > 0 && (
                <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-3" id="step-by-step-card">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                    <ListOrdered className="w-4 h-4 text-indigo-600" />
                    Step-by-Step Scaffolding Guide
                  </div>
                  <div className="space-y-2">
                    {adaptedContent.stepByStep.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed font-medium">{step.replace(/^\d+\.\s*/, '')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Core Explanation */}
              <div className="space-y-3 text-sm leading-relaxed text-slate-700">
                <div className="font-semibold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Concept Deep Dive
                </div>
                <div className="markdown-body prose prose-slate max-w-none text-slate-700">
                  <ReactMarkdown>{adaptedContent.coreExplanation}</ReactMarkdown>
                </div>
              </div>

              {/* Concrete Applied Example */}
              {adaptedContent.concreteExample && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-indigo-600" />
                    Applied Working Example
                  </span>
                  <p className="text-slate-600 leading-relaxed">{adaptedContent.concreteExample}</p>
                </div>
              )}

              {/* Key Takeaways */}
              {adaptedContent.keyTakeaways && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Key Takeaways</span>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {adaptedContent.keyTakeaways.map((takeaway, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            /* Original Textbook Version */
            <div className="space-y-6 text-slate-800">
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-semibold">
                  Standard Academic Curriculum
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{currentTopic.title}</h1>
                <p className="text-sm text-slate-600 leading-relaxed">{currentTopic.originalContent.overview}</p>
              </div>

              {currentTopic.originalContent.mathematicalFormula && (
                <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
                  <span className="text-indigo-400 block text-[10px] uppercase tracking-wider mb-1">Formal Mathematical Definition:</span>
                  {currentTopic.originalContent.mathematicalFormula}
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Technical Specifications</h3>
                <ul className="space-y-2 text-xs text-slate-600">
                  {currentTopic.originalContent.technicalDetails.map((detail, idx) => (
                    <li key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs text-slate-700 space-y-1">
                <span className="font-bold text-indigo-900 block">Standard Textbook Summary:</span>
                <p>{currentTopic.originalContent.standardExplanation}</p>
              </div>
            </div>
          )}
        </div>

        {/* Retrieved Context Sources Drawer */}
        {ragSources.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4" id="rag-sources-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Authoritative Reference Citations & Ingested Context ({ragSources.length} Extracts)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Semantic Vector Relevance</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {ragSources.map((chunk, i) => (
                <div key={chunk.id || i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded">
                      {chunk.sourceType || 'Textbook'}
                    </span>
                    {chunk.relevanceScore && (
                      <span className="text-[10px] font-mono text-emerald-600 font-semibold">
                        Cosine Match: {chunk.relevanceScore}
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-slate-900 text-xs">{chunk.title}</p>
                  <p className="text-slate-600 line-clamp-3 text-[11px] leading-relaxed">{chunk.content}</p>
                  <span className="text-[10px] text-slate-400 block pt-1">{chunk.source}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Call to Action: Proceed to Quiz */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-indigo-800/50 flex flex-col sm:flex-row items-center justify-between gap-6" id="proceed-to-quiz-cta">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <HelpCircle className="w-3.5 h-3.5" />
              Checkpoint Assessment Ready
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Ready to Test Your Understanding?
            </h3>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-xl">
              Proceed to the topic checkpoint quiz. If you encounter any challenging questions, you can click the <strong>Re-read button</strong> at any time to return here and review the concept.
            </p>
          </div>

          <button
            onClick={onNavigateToQuiz}
            id="btn-navigate-to-quiz"
            className="px-6 py-3.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm rounded-2xl shadow-md shadow-indigo-500/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:scale-95 shrink-0 cursor-pointer"
          >
            Take Topic Quiz ({currentTopic.quiz.length} Questions)
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
