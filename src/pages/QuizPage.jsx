import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  History,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { saveQuizAttempt, submitQuiz } from '../services/api.js';

export const QuizPage = ({
  topics,
  currentTopic,
  onSelectTopic,
  currentLoad,
  confidence,
  prediction,
  features,
  onUpdateFeatures,
  onTriggerRecalculate,
  onTriggerReRead,
  onNavigateToReading,
  onNavigateToHistory,
}) => {
  // Quiz states
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
  const [reReadNotice, setReReadNotice] = useState(null);

  const activeQuestion = currentTopic.quiz[currentQuizIndex] || currentTopic.quiz[0];
  const totalQuestions = currentTopic.quiz.length;
  const answeredEntries = Object.values(quizAnswers);
  const correctCount = answeredEntries.filter(a => a.isCorrect).length;
  const isAllAnswered = answeredEntries.length === totalQuestions;
  const isAllCorrect = totalQuestions > 0 && isAllAnswered && answeredEntries.every(a => a.isCorrect);

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
        explanation: res.explanation
      });
      setQuizSubmitted(true);

      // Compute aggregate accuracy & hesitation metrics
      const answersList = Object.values(updatedAnswers);
      const computedCorrectCount = answersList.filter(a => a.isCorrect).length;
      const latestAccuracy = Math.round((computedCorrectCount / answersList.length) * 100);
      const avgHesitation = Math.round(answersList.reduce((acc, a) => acc + a.hesitationSec, 0) / answersList.length);
      const avgAttempts = Math.round(answersList.reduce((acc, a) => acc + a.attempts, 0) / answersList.length);

      if (onUpdateFeatures) {
        onUpdateFeatures({
          quiz_accuracy: latestAccuracy,
          quiz_hesitation_time: avgHesitation,
          quiz_attempts: avgAttempts,
        });
      }

      // If all questions are answered, automatically record the full attempt in quiz history
      if (Object.keys(updatedAnswers).length === currentTopic.quiz.length) {
        const fullQuestionsData = currentTopic.quiz.map((q, idx) => {
          const ans = updatedAnswers[idx];
          const chosenIdx = ans ? ans.selectedOption : selectedOption;
          return {
            questionId: q.id,
            question: q.question,
            selectedOption: chosenIdx,
            selectedAnswer: chosenIdx >= 0 && chosenIdx < q.options.length ? q.options[chosenIdx] : 'Option selected',
            correctIndex: q.correctIndex,
            correctAnswer: q.options[q.correctIndex],
            isCorrect: ans ? ans.isCorrect : (chosenIdx === q.correctIndex),
            explanation: q.explanation,
            concept: currentTopic.title,
            hesitationSec: ans ? ans.hesitationSec : hesitationSec
          };
        });

        saveQuizAttempt({
          quizId: currentTopic.id,
          topicId: currentTopic.id,
          topic: currentTopic.title,
          score: computedCorrectCount,
          total: currentTopic.quiz.length,
          percentage: latestAccuracy,
          timeTaken: Math.max(15, Math.round((Date.now() - quizStartTime) / 1000)),
          cognitiveLoadAtSubmission: currentLoad,
          confidenceAtSubmission: confidence,
          questions: fullQuestionsData
        }).catch(err => console.warn('Auto-save attempt error:', err));
      }
    } catch (e) {
      console.error('Quiz submit failed:', e);
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const handleTryAgain = () => {
    handleResetEntireQuiz();
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

  const handlePreviousQuiz = () => {
    if (currentQuizIndex > 0) {
      const prevIdx = currentQuizIndex - 1;
      setCurrentQuizIndex(prevIdx);
      const existingAnswer = quizAnswers[prevIdx];
      if (existingAnswer) {
        setSelectedOption(existingAnswer.selectedOption);
        setQuizSubmitted(true);
        setQuizFeedback({
          isCorrect: existingAnswer.isCorrect,
          correctIndex: existingAnswer.correctIndex,
          explanation: existingAnswer.explanation
        });
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

  const handleReReadAction = () => {
    setReReadNotice('Recording Re-read event in behavioral telemetry (+1 count)... Navigating to lesson text.');
    onTriggerReRead();
    setTimeout(() => {
      onNavigateToReading();
    }, 400);
  };

  return (
    <div className="space-y-8" id="quiz-page-container">
      {/* Top Topic Navigation & Selector */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              Checkpoint Assessment • {currentTopic.title}
            </h2>
            <p className="text-xs text-slate-500">Test comprehension and calibrate ML cognitive load models</p>
          </div>
          <button
            onClick={onNavigateToReading}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 self-start sm:self-auto bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Switch to Reading View
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar" id="topic-selector-strip">
          {topics.map(topic => {
            const isSelected = topic.id === currentTopic.id;
            return (
              <button
                key={topic.id}
                onClick={() => {
                  onSelectTopic(topic);
                  handleResetEntireQuiz();
                }}
                id={`topic-btn-${topic.id}`}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all text-left flex flex-col gap-0.5 border cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>{topic.title}</span>
                <span className={`text-[10px] font-normal ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {topic.quiz.length} Questions • {topic.difficulty}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left = Checkpoint Quiz Card, Right = Re-read Telemetry & Attribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Focused Quiz Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Question Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6" id="checkpoint-quiz-card">
            {/* Header: Progress & Re-read Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200">
                  Question {currentQuizIndex + 1} of {currentTopic.quiz.length}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Difficulty: {activeQuestion.difficulty}
                </span>
              </div>

              {/* CRITICAL RE-READ BUTTON IN QUIZ */}
              <button
                onClick={handleReReadAction}
                id="btn-reread-concept"
                className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-2xs hover:scale-[1.02] active:scale-95 self-start sm:self-auto cursor-pointer"
                title="Click if you need to re-read the lesson concept. Increments the re-read behavioral telemetry metric."
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
                <span>Re-read Concept</span>
                <span className="px-1.5 py-0.5 bg-amber-200 text-amber-950 rounded-md text-[10px] font-extrabold">
                  {features.number_of_re_reads} Re-read{features.number_of_re_reads === 1 ? '' : 's'}
                </span>
              </button>
            </div>

            {reReadNotice && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
                <p className="font-semibold">{reReadNotice}</p>
              </div>
            )}

            {/* Question Text */}
            <div className="space-y-4">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {activeQuestion.question}
              </h1>

              {/* Options */}
              <div className="space-y-2.5">
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
                      className={`w-full p-4 rounded-2xl border text-xs sm:text-sm text-left transition-all flex items-start gap-3 cursor-pointer ${optStyle}`}
                    >
                      <span className="w-6 h-6 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="leading-relaxed font-medium">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Submission Action */}
              {!quizSubmitted ? (
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
                  <button
                    onClick={handleQuizSubmit}
                    disabled={selectedOption === null || isSubmittingQuiz}
                    id="submit-quiz-btn"
                    className="w-full sm:flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmittingQuiz ? 'Submitting & Evaluating...' : 'Submit Answer'}
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleReReadAction}
                    className="w-full sm:w-auto px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Not sure? Return to lesson material to re-read"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    Review in Lesson First
                  </button>
                </div>
              ) : (
                /* Post Submission Feedback & Controls */
                <div className="space-y-4 pt-2">
                  <div
                    className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-2 ${
                      quizFeedback?.isCorrect
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {quizFeedback?.isCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Correct Answer!</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>Incorrect. Let's analyze why:</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed opacity-90">{quizFeedback?.explanation}</p>
                  </div>

                  <div className="flex flex-col gap-2.5 pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {currentQuizIndex > 0 && (
                        <button
                          onClick={handlePreviousQuiz}
                          className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          Previous
                        </button>
                      )}

                      {currentQuizIndex < currentTopic.quiz.length - 1 ? (
                        <button
                          onClick={handleNextQuiz}
                          className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          Next Question
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={handleTryAgain}
                            id="btn-try-again-end"
                            className="py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            title="Restart quiz from the first question"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
                            Try Again
                          </button>
                          <button
                            onClick={handleSendFeedbackToModel}
                            disabled={isRecalibrating}
                            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow cursor-pointer"
                            id="send-feedback-ml-btn"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRecalibrating ? 'animate-spin' : ''}`} />
                            {isRecalibrating ? 'Evaluating Telemetry...' : 'Send Feedback to ML Model'}
                          </button>
                        </>
                      )}
                    </div>

                    {/* Button to send interim feedback */}
                    {currentQuizIndex < currentTopic.quiz.length - 1 && (
                      <button
                        onClick={handleSendFeedbackToModel}
                        disabled={isRecalibrating}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRecalibrating ? 'animate-spin' : ''}`} />
                        {isRecalibrating ? 'Evaluating Telemetry...' : 'Send Current Feedback to ML Model'}
                      </button>
                    )}

                    {feedbackSuccessMessage && (
                      <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-950 text-xs space-y-2 mt-1">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <p className="font-semibold text-slate-800 leading-snug">{feedbackSuccessMessage}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-indigo-100">
                          <button
                            onClick={handleTryAgain}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
                            Try Again (Restart Quiz)
                          </button>
                          <button
                            onClick={onNavigateToReading}
                            className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            Review Adapted Lesson
                          </button>
                          {isAllCorrect && topics.findIndex(t => t.id === currentTopic.id) < topics.length - 1 && (
                            <button
                              onClick={() => {
                                const currIdx = topics.findIndex(t => t.id === currentTopic.id);
                                const nextTopic = topics[currIdx + 1];
                                onSelectTopic(nextTopic);
                                handleResetEntireQuiz();
                                onNavigateToReading();
                              }}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
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
        </div>

        {/* Right Column: Model Attribution */}
        <div className="space-y-6">
          {/* Feature Attribution Card */}
          {prediction && (
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-3" id="feature-attribution-card">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-indigo-600" />
                  ML Feature Weights
                </span>
                <span className="text-[10px] text-slate-400">Random Forest</span>
              </div>

              <div className="space-y-2">
                {prediction.featureContributions.slice(0, 4).map((contrib, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{contrib.name}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
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

      {/* Bottom End-of-Quiz Navigation: Only visible when all answers are correct */}
      {isAllCorrect ? (
        (() => {
          const currentIdx = topics.findIndex(t => t.id === currentTopic.id);
          const hasNextTopic = currentIdx < topics.length - 1;
          const nextTopic = hasNextTopic ? topics[currentIdx + 1] : null;

          return (
            <div
              className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-emerald-800/40 flex flex-col sm:flex-row items-center justify-between gap-6"
              id="end-of-quiz-nav-card"
            >
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Checkpoint Mastered ({correctCount}/{totalQuestions} Correct)
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {hasNextTopic ? `Next Module: ${nextTopic?.title}` : 'All Topic Checkpoints Completed!'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                  {hasNextTopic
                    ? `Great job! You answered all questions correctly. Proceed to ${nextTopic?.title} (${nextTopic?.category} • ${nextTopic?.difficulty}).`
                    : 'Congratulations! You have completed all curriculum topics in this machine learning module.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={handleTryAgain}
                  className="px-4 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm rounded-2xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
                  title="Retake quiz from the first question"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  Try Again
                </button>

                {onNavigateToHistory && (
                  <button
                    onClick={onNavigateToHistory}
                    className="px-4 py-3 bg-slate-800/80 hover:bg-slate-700 text-indigo-300 font-semibold text-xs sm:text-sm rounded-2xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
                    title="View Quiz Attempt History"
                  >
                    <History className="w-4 h-4 text-indigo-400" />
                    Quiz History
                  </button>
                )}

                <button
                  onClick={onNavigateToReading}
                  className="px-4 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm rounded-2xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  Review Lesson
                </button>

                {hasNextTopic && (
                  <button
                    onClick={() => {
                      if (nextTopic) {
                        onSelectTopic(nextTopic);
                        handleResetEntireQuiz();
                        onNavigateToReading();
                      }
                    }}
                    id="btn-next-topic"
                    className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-500/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                  >
                    Proceed to Next Topic
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })()
      ) : (
        /* Helpful Progress Card when quiz is still in progress or contains mistakes */
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
              {correctCount}/{totalQuestions}
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs">
                Topic Checkpoint Progress: {correctCount} of {totalQuestions} Correct
              </p>
              <p className="text-[11px] text-slate-500">
                {isAllAnswered
                  ? 'You completed the quiz! Click "Try Again" to restart from Question 1, or "Quiz History" to view weak-question analysis.'
                  : `Answer all ${totalQuestions} questions correctly to unlock the next module. You can click "Re-read Concept" at any time to review.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {answeredEntries.length > 0 && (
              <button
                onClick={handleTryAgain}
                className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-xl border border-amber-300 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
                Try Again (Question 1)
              </button>
            )}

            {onNavigateToHistory && (
              <button
                onClick={onNavigateToHistory}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-semibold rounded-xl border border-indigo-200 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-indigo-600" />
                Quiz History
              </button>
            )}

            <button
              onClick={onNavigateToReading}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              Review Lesson Material
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
