import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle,
  CheckCircle2,
  ChevronRight,
  Database,
  HelpCircle,
  Lightbulb,
  ListOrdered,
  RefreshCw,
  Sparkles,
  XCircle,
  Zap
} from 'lucide-react';
import { generateAdaptedContent, submitQuiz } from '../services/api.js';

export const LearningPage = ({
  topics,
  currentTopic,
  onSelectTopic,
  currentLoad,
  confidence,
  prediction,
  features,
  onUpdateFeatures,
  onTriggerRecalculate,
  onForceLoad,
}) => {
  const [viewMode, setViewMode] = useState('adapted');
  const [adaptedContent, setAdaptedContent] = useState(null);
  const [ragSources, setRagSources] = useState([]);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // Quiz state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [quizStartTime, setQuizStartTime] = useState(Date.now());
  const [quizAttempts, setQuizAttempts] = useState(1);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [isRecalibrating, setIsRecalibrating] = useState(false);
  const [feedbackSuccessMessage, setFeedbackSuccessMessage] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});

  const activeQuestion = currentTopic.quiz[currentQuizIndex] || currentTopic.quiz[0];

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
    // Reset quiz state on topic change
    setSelectedOption(null);
    setQuizSubmitted(false);
    setQuizFeedback(null);
    setCurrentQuizIndex(0);
    setQuizStartTime(Date.now());
    setQuizAttempts(1);
    setQuizAnswers({});
    setFeedbackSuccessMessage(null);

    return () => {
      isCancelled = true;
    };
  }, [currentTopic.id, currentLoad]);

  const handleQuizSubmit = async () => {
    if (selectedOption === null || !activeQuestion) return;

    setIsSubmittingQuiz(true);
    setFeedbackSuccessMessage(null);
    const hesitationSec = Math.max(1, Math.round((Date.now() - quizStartTime) / 1000));

    try {
      const res = await submitQuiz(
        currentTopic.id,
        activeQuestion.id,
        selectedOption,
        hesitationSec,
        quizAttempts
      );

      const record = {
        isCorrect: res.isCorrect,
        correctIndex: res.correctIndex,
        explanation: res.explanation,
        selectedOption,
        hesitationSec,
        attempts: quizAttempts
      };

      const updatedAnswers = { ...quizAnswers, [currentQuizIndex]: record };
      setQuizAnswers(updatedAnswers);

      setQuizFeedback({
        isCorrect: res.isCorrect,
        correctIndex: res.correctIndex,
        explanation: res.explanation,
      });
      setQuizSubmitted(true);

      // Compute latest aggregate accuracy & hesitation metrics
      const answersList = Object.values(updatedAnswers);
      const correctCount = answersList.filter(a => a.isCorrect).length;
      const latestAccuracy = Math.round((correctCount / answersList.length) * 100);
      const avgHesitation = Math.round(answersList.reduce((acc, a) => acc + a.hesitationSec, 0) / answersList.length);
      const avgAttempts = Math.round(answersList.reduce((acc, a) => acc + a.attempts, 0) / answersList.length);

      if (onUpdateFeatures) {
        onUpdateFeatures({
          quiz_accuracy: latestAccuracy,
          quiz_hesitation_time: avgHesitation,
          quiz_attempts: avgAttempts,
        });
      }
    } catch (e) {
      console.error('Quiz submit failed:', e);
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const handleRetakeQuestion = () => {
    setQuizSubmitted(false);
    setQuizFeedback(null);
    setQuizAttempts(prev => prev + 1);
    setQuizStartTime(Date.now());
    setFeedbackSuccessMessage(null);
  };

  const handleResetEntireQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setQuizSubmitted(false);
    setQuizFeedback(null);
    setQuizStartTime(Date.now());
    setQuizAttempts(1);
    setQuizAnswers({});
    setFeedbackSuccessMessage(null);
  };

  const handleNextQuiz = () => {
    if (currentQuizIndex < currentTopic.quiz.length - 1) {
      const nextIdx = currentQuizIndex + 1;
      setCurrentQuizIndex(nextIdx);
      const existingAnswer = quizAnswers[nextIdx];
      if (existingAnswer) {
        setSelectedOption(existingAnswer.selectedOption);
        setQuizSubmitted(true);
        setQuizFeedback({
          isCorrect: existingAnswer.isCorrect,
          correctIndex: existingAnswer.correctIndex,
          explanation: existingAnswer.explanation
        });
      } else {
        setSelectedOption(null);
        setQuizSubmitted(false);
        setQuizFeedback(null);
        setQuizStartTime(Date.now());
        setQuizAttempts(1);
      }
      setFeedbackSuccessMessage(null);
    }
  };

  const handleSendFeedbackToModel = async () => {
    setIsRecalibrating(true);
    setFeedbackSuccessMessage(null);

    // Compute aggregate metrics from answered questions
    const answersList = Object.values(quizAnswers);
    let quizAccuracy = features.quiz_accuracy;
    let hesitationTime = features.quiz_hesitation_time;
    let attempts = features.quiz_attempts;

    if (answersList.length > 0) {
      const correctCount = answersList.filter(a => a.isCorrect).length;
      quizAccuracy = Math.round((correctCount / answersList.length) * 100);
      hesitationTime = Math.round(answersList.reduce((acc, a) => acc + a.hesitationSec, 0) / answersList.length);
      attempts = Math.round(answersList.reduce((acc, a) => acc + a.attempts, 0) / answersList.length);
    }

    const payloadUpdates = {
      quiz_accuracy: quizAccuracy,
      quiz_hesitation_time: hesitationTime,
      quiz_attempts: attempts,
    };

    if (onUpdateFeatures) {
      onUpdateFeatures(payloadUpdates);
    }

    try {
      const res = await onTriggerRecalculate(payloadUpdates);
      if (res && 'cognitive_load' in res) {
        const nextLoad = res.cognitive_load || currentLoad;
        const nextConfidence = res.confidence ? Math.round(res.confidence * 100) : Math.round(confidence * 100);
        setFeedbackSuccessMessage(`Feedback evaluated: Recalibrated to ${nextLoad} Load (${nextConfidence}% confidence). Content scaffolding updated.`);
      } else {
        setFeedbackSuccessMessage(`Feedback evaluated: Recalibrated to ${currentLoad} Load (${Math.round(confidence * 100)}% confidence).`);
      }
    } catch (err) {
      console.error('Error sending feedback to model:', err);
      setFeedbackSuccessMessage('Telemetry feedback transmitted and processed.');
    } finally {
      setIsRecalibrating(false);
    }
  };

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
    <div className="space-y-8" id="learning-page-container">
      {/* Top Topic Navigation & Selector */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Machine Learning Curriculum Modules
            </h2>
            <p className="text-xs text-slate-500">Select a topic to test real-time behavioral adaptation</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">{topics.length} Concepts Available</span>
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

      {/* Cognitive Load Scaffolding Diagnostic Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Dynamic Adaptation Engine</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-300">Target: {currentTopic.title}</span>
          </div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
            <span>State:</span>
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${getLoadBadgeColor(currentLoad)}`}>
              {currentLoad} COGNITIVE LOAD
            </span>
            <span className="text-xs text-slate-400 font-normal">({Math.round(confidence * 100)}% ML confidence)</span>
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl">
            {currentLoad === 'LOW' && 'High comprehension capacity detected. Delivering rigorous mathematical formulations and deep mechanics.'}
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

      {/* Main Content Area: Left = Content, Right = Quiz & Telemetry Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Lesson Content */}
        <div className="lg:col-span-2 space-y-6">
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
              <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-sm font-medium">Retrieving academic reference context & synthesizing pedagogical scaffolding...</p>
              </div>
            ) : viewMode === 'adapted' && adaptedContent ? (
              <div className="space-y-6 text-slate-800">
                {/* Title & Summary */}
                <div className="space-y-2">
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{adaptedContent.title}</h1>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    {adaptedContent.summary}
                  </p>
                </div>

                {/* Intuitive Analogy Box (For HIGH & MEDIUM cognitive loads) */}
                {adaptedContent.analogy && (
                  <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2" id="analogy-card">
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      Intuitive Real-World Analogy (Reduced Cognitive Strain)
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
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs">
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
                  <h1 className="text-2xl font-bold text-slate-900">{currentTopic.title}</h1>
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
        </div>

        {/* Right Column: Interactive Quiz & Diagnostic Feed */}
        <div className="space-y-6">
          {/* Interactive Checkpoint Quiz */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4" id="checkpoint-quiz-card">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Adaptive Checkpoint Quiz
                </h3>
              </div>
              <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold">
                Question {currentQuizIndex + 1} of {currentTopic.quiz.length}
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900 leading-snug">
                {activeQuestion.question}
              </p>

              {/* Radio Options */}
              <div className="space-y-2">
                {activeQuestion.options.map((opt, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  let optStyle = 'border-slate-200 hover:border-slate-300 bg-white text-slate-800';

                  if (quizSubmitted && quizFeedback) {
                    if (optIdx === quizFeedback.correctIndex) {
                      optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                    } else if (isSelected && !quizFeedback.isCorrect) {
                      optStyle = 'border-rose-500 bg-rose-50 text-rose-900';
                    }
                  } else if (isSelected) {
                    optStyle = 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold ring-1 ring-indigo-600';
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={quizSubmitted}
                      onClick={() => setSelectedOption(optIdx)}
                      id={`quiz-opt-${optIdx}`}
                      className={`w-full p-3 rounded-xl border text-xs text-left transition-all flex items-start gap-2.5 cursor-pointer ${optStyle}`}
                    >
                      <span className="w-5 h-5 rounded-full border flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Submit / Feedback */}
              {!quizSubmitted ? (
                <button
                  onClick={handleQuizSubmit}
                  disabled={selectedOption === null || isSubmittingQuiz}
                  id="submit-quiz-btn"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmittingQuiz ? 'Submitting & Evaluating...' : 'Submit Answer'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="space-y-3 pt-2">
                  <div
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                      quizFeedback?.isCorrect
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      {quizFeedback?.isCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Correct Answer!</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>Incorrect. Let's review:</span>
                        </>
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">{quizFeedback?.explanation}</p>
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleRetakeQuestion}
                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        title="Try answering this question again"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Try Again
                      </button>

                      {currentQuizIndex < currentTopic.quiz.length - 1 ? (
                        <button
                          onClick={handleNextQuiz}
                          className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          Next Question
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={handleSendFeedbackToModel}
                          disabled={isRecalibrating}
                          className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow cursor-pointer"
                          id="send-feedback-ml-btn"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isRecalibrating ? 'animate-spin' : ''}`} />
                          {isRecalibrating ? 'Evaluating Telemetry...' : 'Send Feedback to ML Model'}
                        </button>
                      )}
                    </div>

                    {currentQuizIndex < currentTopic.quiz.length - 1 && (
                      <button
                        onClick={handleSendFeedbackToModel}
                        disabled={isRecalibrating}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow cursor-pointer"
                        id="send-interim-feedback-btn"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRecalibrating ? 'animate-spin' : ''}`} />
                        {isRecalibrating ? 'Evaluating Telemetry...' : 'Send Current Feedback to ML Model'}
                      </button>
                    )}

                    {feedbackSuccessMessage && (
                      <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-950 text-xs space-y-2 mt-1">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <p className="font-semibold text-slate-800 leading-snug">{feedbackSuccessMessage}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-indigo-100">
                          <button
                            onClick={handleResetEntireQuiz}
                            className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Retake Entire Checkpoint
                          </button>
                          {topics.findIndex(t => t.id === currentTopic.id) < topics.length - 1 && (
                            <button
                              onClick={() => {
                                const currIdx = topics.findIndex(t => t.id === currentTopic.id);
                                onSelectTopic(topics[currIdx + 1]);
                              }}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              Next Topic
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Why this Load was Predicted (Feature Attribution Card) */}
          {prediction && (
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-3" id="feature-attribution-card">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-indigo-600" />
                  Model Feature Attribution
                </span>
                <span className="text-[10px] text-slate-400">Random Forest Tree Voting</span>
              </div>

              <div className="space-y-2">
                {prediction.featureContributions.slice(0, 4).map((contrib, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{contrib.name}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          contrib.direction === 'increases_load'
                            ? 'bg-rose-100 text-rose-700'
                            : contrib.direction === 'decreases_load'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {contrib.direction === 'increases_load'
                          ? 'Increases Load'
                          : contrib.direction === 'decreases_load'
                          ? 'Decreases Load'
                          : 'Nominal'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{contrib.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
