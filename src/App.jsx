import React, { useEffect, useState } from 'react';
import { fetchAnalytics, fetchLessons, logBehaviorEvent, predictCognitiveLoad, resetAnalytics } from './services/api.js';
import { useBehaviorTracker } from './services/behaviorTracker.js';
import { Navbar } from './components/Navbar.jsx';
import { BehaviorTelemetryBar } from './components/BehaviorTelemetryBar.jsx';
import { ResearchDisclaimerModal } from './components/ResearchDisclaimerModal.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { ReadingPage } from './pages/ReadingPage.jsx';
import { QuizPage } from './pages/QuizPage.jsx';
import { QuizHistoryPage } from './pages/QuizHistoryPage.jsx';
import { AdminPage } from './pages/AdminPage.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [topics, setTopics] = useState([]);
  const [currentTopic, setCurrentTopic] = useState(null);
  
  // Cognitive Load & Prediction State
  const [currentLoad, setCurrentLoad] = useState('LOW');
  const [confidence, setConfidence] = useState(0.85);
  const [prediction, setPrediction] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  // Behavioral Simulation Overrides State
  const [isSimulated, setIsSimulated] = useState(true);
  const [simulatedOverrides, setSimulatedOverrides] = useState({
    time_per_page: 75,
    scroll_speed: 340,
    number_of_re_reads: 0,
    backtracking_count: 0,
    quiz_hesitation_time: 7,
    quiz_attempts: 1,
    quiz_accuracy: 88,
    session_duration: 380,
  });

  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  const { features, setFeatures } = useBehaviorTracker(
    currentTopic ? currentTopic.id : 'backpropagation',
    isSimulated,
    simulatedOverrides
  );

  // Load initial lessons & analytics
  useEffect(() => {
    async function init() {
      try {
        const [loadedLessons, loadedAnalytics] = await Promise.all([
          fetchLessons(),
          fetchAnalytics()
        ]);
        setTopics(loadedLessons);
        if (loadedLessons.length > 0) {
          const defaultTopic = loadedLessons.find(l => l.id === 'backpropagation') || loadedLessons[0];
          setCurrentTopic(defaultTopic);
        }
        setAnalytics(loadedAnalytics);
        if (loadedAnalytics) {
          setCurrentLoad(loadedAnalytics.currentLoad);
          setConfidence(loadedAnalytics.currentConfidence);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    }
    init();
  }, []);

  // Recalculate Cognitive Load via Random Forest ML endpoint
  const handleRecalculateLoad = async (customFeatures) => {
    try {
      const activeFeatures = customFeatures ? { ...features, ...customFeatures } : features;
      if (customFeatures) {
        setSimulatedOverrides(prev => ({ ...prev, ...customFeatures }));
        setFeatures(prev => ({ ...prev, ...customFeatures }));
      }
      const pred = await predictCognitiveLoad(activeFeatures);
      setPrediction(pred);
      setCurrentLoad(pred.cognitive_load);
      setConfidence(pred.confidence);

      // Refresh analytics
      const updatedAnalytics = await fetchAnalytics();
      setAnalytics(updatedAnalytics);
      return pred;
    } catch (err) {
      console.error('Failed to recalculate load:', err);
    }
  };

  // Update fine-tuned feature overrides
  const handleUpdateFeatures = (updated) => {
    setSimulatedOverrides(prev => ({ ...prev, ...updated }));
    setFeatures(prev => ({ ...prev, ...updated }));
  };

  // Trigger Re-read from Quiz page
  const handleTriggerReRead = () => {
    const nextReReads = (features.number_of_re_reads || 0) + 1;
    const nextBacktracks = (features.backtracking_count || 0) + 1;
    handleUpdateFeatures({
      number_of_re_reads: nextReReads,
      backtracking_count: nextBacktracks,
    });
    logBehaviorEvent('re_read', nextReReads, currentTopic?.id || 'backpropagation').catch(console.error);
    return nextReReads;
  };

  const handleForceLoad = async (forcedLoad) => {
    setCurrentLoad(forcedLoad);
    setConfidence(0.92);
    if (forcedLoad === 'HIGH') {
      handleUpdateFeatures({
        time_per_page: 250,
        number_of_re_reads: 5,
        backtracking_count: 4,
        quiz_hesitation_time: 35,
        quiz_accuracy: 42
      });
    } else if (forcedLoad === 'MEDIUM') {
      handleUpdateFeatures({
        time_per_page: 140,
        number_of_re_reads: 2,
        backtracking_count: 2,
        quiz_hesitation_time: 16,
        quiz_accuracy: 70
      });
    } else {
      handleUpdateFeatures({
        time_per_page: 65,
        number_of_re_reads: 0,
        backtracking_count: 0,
        quiz_hesitation_time: 5,
        quiz_accuracy: 95
      });
    }
    setTimeout(() => {
      handleRecalculateLoad();
    }, 100);
  };

  const handleResetSession = async () => {
    try {
      const freshAnalytics = await resetAnalytics();
      setAnalytics(freshAnalytics);
      setCurrentLoad('LOW');
      setConfidence(0.85);
      handleUpdateFeatures({
        time_per_page: 60,
        scroll_speed: 380,
        number_of_re_reads: 0,
        backtracking_count: 0,
        quiz_hesitation_time: 6,
        quiz_attempts: 1,
        quiz_accuracy: 90,
        session_duration: 120
      });
    } catch (err) {
      console.error('Failed to reset session:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white" id="app-root">
      {/* Top Main Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentLoad={currentLoad}
        confidence={confidence}
        onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
        isSimulating={isSimulated}
      />

      {/* Behavioral Telemetry Engine Ribbon */}
      <BehaviorTelemetryBar
        features={features}
        onUpdateFeatures={handleUpdateFeatures}
        onTriggerPrediction={handleRecalculateLoad}
        currentLoad={currentLoad}
        confidence={confidence}
        isSimulated={isSimulated}
        setIsSimulated={setIsSimulated}
      />

      {/* Main View Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {activeTab === 'home' && (
          <HomePage
            onStartLearning={() => setActiveTab('reading')}
            currentLoad={currentLoad}
            onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
          />
        )}

        {activeTab === 'reading' && (
          currentTopic ? (
            <ReadingPage
              topics={topics}
              currentTopic={currentTopic}
              onSelectTopic={t => setCurrentTopic(t)}
              currentLoad={currentLoad}
              confidence={confidence}
              features={features}
              onForceLoad={handleForceLoad}
              onNavigateToQuiz={() => setActiveTab('quiz')}
            />
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-500 space-y-3 border border-slate-200">
              <div className="w-8 h-8 mx-auto border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Loading Adaptive Learning Curriculum...</p>
            </div>
          )
        )}

        {activeTab === 'quiz' && (
          currentTopic ? (
            <QuizPage
              topics={topics}
              currentTopic={currentTopic}
              onSelectTopic={t => setCurrentTopic(t)}
              currentLoad={currentLoad}
              confidence={confidence}
              prediction={prediction}
              features={features}
              onUpdateFeatures={handleUpdateFeatures}
              onTriggerRecalculate={handleRecalculateLoad}
              onTriggerReRead={handleTriggerReRead}
              onNavigateToReading={() => setActiveTab('reading')}
              onNavigateToHistory={() => setActiveTab('history')}
              onForceLoad={handleForceLoad}
            />
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-500 space-y-3 border border-slate-200">
              <div className="w-8 h-8 mx-auto border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Loading Topic Quiz...</p>
            </div>
          )
        )}

        {activeTab === 'history' && (
          <QuizHistoryPage
            topics={topics}
            currentLoad={currentLoad}
            confidence={confidence}
            onNavigateToQuiz={(topicId) => {
              if (topicId) {
                const found = topics.find(t => t.id === topicId);
                if (found) setCurrentTopic(found);
              }
              setActiveTab('quiz');
            }}
            onNavigateToReading={(topicId) => {
              if (topicId) {
                const found = topics.find(t => t.id === topicId);
                if (found) setCurrentTopic(found);
              }
              setActiveTab('reading');
            }}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPage
            analytics={analytics}
            features={features}
            onResetSession={handleResetSession}
          />
        )}
      </main>

      {/* Academic & Research Disclaimer Modal */}
      <ResearchDisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />
    </div>
  );
}
