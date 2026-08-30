import React, { useEffect, useState } from 'react';
import { fetchAnalytics, fetchLessons, logBehaviorEvent, predictCognitiveLoad, resetAnalytics } from './services/api.js';
import { useBehaviorTracker } from './services/behaviorTracker.js';
import { subscribeToAuthChanges, logoutUser } from './services/firebase.js';
import { Navbar } from './components/Navbar.jsx';
import { BehaviorTelemetryBar } from './components/BehaviorTelemetryBar.jsx';
import { ResearchDisclaimerModal } from './components/ResearchDisclaimerModal.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { ReadingPage } from './pages/ReadingPage.jsx';
import { QuizPage } from './pages/QuizPage.jsx';
import { QuizHistoryPage } from './pages/QuizHistoryPage.jsx';
import { AdminPage } from './pages/AdminPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';

export default function App() {
  // Authentication & Learner Profile State - Always start at Login page
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  // Process OAuth Callback and Load initial lessons & analytics
  useEffect(() => {
    let isAuthSuccess = false;

    // 1. Detect OAuth Return URL parameters
    try {
      const urlParams = new URLSearchParams(window.location.search);
      isAuthSuccess = urlParams.get('auth_success') === 'true';
      const rawUserData = urlParams.get('userData');
      const authError = urlParams.get('auth_error');

      if (isAuthSuccess && rawUserData) {
        const oauthUser = JSON.parse(decodeURIComponent(rawUserData));
        setCurrentUser(oauthUser);
        setIsAuthenticated(true);
        setActiveTab('home');
        try {
          localStorage.setItem('adaptive_learning_user', JSON.stringify(oauthUser));
        } catch {}
        // Clean URL query parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (authError) {
        console.warn('OAuth Error:', authError);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (e) {
      console.warn('Error parsing OAuth return payload:', e);
    }

    // 2. Attach Firebase Auth State Listener (syncs profile without bypassing initial login page)
    const unsubscribe = subscribeToAuthChanges((fbUser) => {
      if (fbUser) {
        setCurrentUser((prev) => (prev ? { ...prev, ...fbUser } : null));
      }
    });

    // 3. Load initial curriculum & analytics
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

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
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

  // Authentication Handlers
  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setActiveTab('home');
    try {
      localStorage.setItem('adaptive_learning_user', JSON.stringify(user));
    } catch (e) {
      console.warn('Could not save user to localStorage:', e);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setActiveTab('home');
  };

  // If user is not authenticated, display the Login Page flow first
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

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
        currentUser={currentUser}
        onLogout={handleLogout}
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
          Boolean(
            currentUser?.role === 'Admin' ||
            currentUser?.isAdmin === true ||
            currentUser?.role?.toLowerCase().includes('admin') ||
            currentUser?.role?.toLowerCase().includes('instructor')
          ) ? (
            <AdminPage
              analytics={analytics}
              features={features}
              onResetSession={handleResetSession}
              currentUser={currentUser}
            />
          ) : (
            <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl p-8 border border-rose-200 shadow-xl text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="space-y-1">
                <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full uppercase tracking-wider">
                  403 Access Forbidden
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 pt-2">Administrator ID Required</h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  You are currently logged in as a <strong>Student / Learner ({currentUser?.name || 'Alex Mercer'})</strong>. The Admin Dashboard is restricted to verified Administrator credentials.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setActiveTab('home')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Return to Student Overview
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl border border-slate-300 cursor-pointer transition-all"
                >
                  Sign Out to Login as Admin
                </button>
              </div>
            </div>
          )
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
