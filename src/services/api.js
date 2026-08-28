const API_BASE = '/api';

async function safeFetchJson(url, options, fallbackError = 'API request failed') {
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';
  
  if (!res.ok) {
    let errorMsg = `${fallbackError} (status ${res.status})`;
    if (contentType.includes('application/json')) {
      try {
        const errorData = await res.json();
        errorMsg = errorData.error || errorMsg;
      } catch {
        // use default error message
      }
    }
    throw new Error(errorMsg);
  }

  if (contentType.includes('application/json')) {
    return await res.json();
  }
  
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Invalid response format from ${url}`);
  }
}

export async function fetchLessons() {
  const data = await safeFetchJson(`${API_BASE}/lessons`, undefined, 'Failed to fetch lessons');
  return data.lessons;
}

export async function fetchLessonById(id) {
  const data = await safeFetchJson(`${API_BASE}/lessons/${id}`, undefined, 'Failed to fetch lesson');
  return data.lesson;
}

export async function predictCognitiveLoad(features) {
  const data = await safeFetchJson(
    `${API_BASE}/predict-load`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(features),
    },
    'Failed to predict cognitive load'
  );
  return data.prediction;
}

export async function generateAdaptedContent(
  topicId,
  cognitiveLoad,
  confidence,
  consecutiveHighLoadCount = 0,
  features,
  customQuery
) {
  return safeFetchJson(
    `${API_BASE}/generate-content`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topicId,
        cognitiveLoad,
        confidence,
        consecutiveHighLoadCount,
        features,
        customQuery
      }),
    },
    'Failed to generate adapted content'
  );
}

export async function searchRAG(query, topicId, topK = 4) {
  const data = await safeFetchJson(
    `${API_BASE}/rag/search`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, topicId, topK }),
    },
    'Failed to search RAG store'
  );
  return data.results;
}

export async function fetchDocuments() {
  return safeFetchJson(`${API_BASE}/documents`, undefined, 'Failed to fetch indexed documents');
}

export async function uploadDocument(doc) {
  return safeFetchJson(
    `${API_BASE}/documents/upload`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    },
    'Failed to upload document'
  );
}

export async function submitQuiz(topicId, questionId, selectedIndex, hesitationTime, attempts) {
  return safeFetchJson(
    `${API_BASE}/quiz/submit`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicId, questionId, selectedIndex, hesitationTime, attempts }),
    },
    'Failed to submit quiz'
  );
}

export async function logBehaviorEvent(eventType, value, topicId) {
  try {
    const res = await fetch(`${API_BASE}/behavior`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, value, topicId }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Non-blocking log
  }
}

export async function fetchAnalytics() {
  const data = await safeFetchJson(`${API_BASE}/analytics`, undefined, 'Failed to fetch analytics');
  return data.analytics;
}

export async function resetAnalytics() {
  const data = await safeFetchJson(`${API_BASE}/analytics/reset`, { method: 'POST' }, 'Failed to reset analytics');
  return data.analytics;
}

export async function fetchModelMetrics() {
  const data = await safeFetchJson(`${API_BASE}/model/metrics`, undefined, 'Failed to fetch model metrics');
  return data.metrics;
}

export async function retrainModel(sampleCount = 1200) {
  const data = await safeFetchJson(
    `${API_BASE}/model/retrain`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleCount }),
    },
    'Failed to retrain model'
  );
  return data.metrics;
}

export async function fetchDatasetSample() {
  return safeFetchJson(`${API_BASE}/dataset`, undefined, 'Failed to fetch dataset samples');
}

// ================= QUIZ ATTEMPTS & WEAK QUESTION ANALYSIS =================

const LOCAL_STORAGE_KEY_QUIZ_ATTEMPTS = 'cognitive_engine_quiz_attempts';

export async function saveQuizAttempt(attemptData) {
  try {
    const data = await safeFetchJson(
      `${API_BASE}/quiz/attempt`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attemptData),
      },
      'Failed to save quiz attempt'
    );

    try {
      const existingRaw = localStorage.getItem(LOCAL_STORAGE_KEY_QUIZ_ATTEMPTS);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [data.attempt, ...existing.filter(a => a.id !== data.attempt.id)];
      localStorage.setItem(LOCAL_STORAGE_KEY_QUIZ_ATTEMPTS, JSON.stringify(updated.slice(0, 50)));
    } catch {
      // ignore localStorage limits
    }

    return data;
  } catch (err) {
    console.warn('Backend attempt save failed, using local storage fallback:', err);
    const localAttempt = {
      id: `local-att-${Date.now()}`,
      quizId: attemptData.quizId || 'quiz',
      topicId: attemptData.topicId || 'general',
      topic: attemptData.topic || 'Machine Learning Module',
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      score: attemptData.score || 0,
      total: attemptData.total || (attemptData.questions?.length || 1),
      percentage: attemptData.percentage || Math.round(((attemptData.score || 0) / (attemptData.total || 1)) * 100),
      timeTaken: attemptData.timeTaken || 60,
      cognitiveLoadAtSubmission: attemptData.cognitiveLoadAtSubmission || 'LOW',
      confidenceAtSubmission: attemptData.confidenceAtSubmission || 0.85,
      questions: attemptData.questions || []
    };

    try {
      const existingRaw = localStorage.getItem(LOCAL_STORAGE_KEY_QUIZ_ATTEMPTS);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [localAttempt, ...existing];
      localStorage.setItem(LOCAL_STORAGE_KEY_QUIZ_ATTEMPTS, JSON.stringify(updated.slice(0, 50)));
    } catch {}

    const analysis = await fetchWeakQuestionAnalysis().catch(() => ({
      hasSufficientData: false,
      minAttemptsRequired: 2,
      totalAttemptsAnalyzed: 1,
      mostDifficultQuestion: null,
      rankedQuestions: []
    }));

    return { attempt: localAttempt, weakQuestionAnalysis: analysis };
  }
}

export async function fetchQuizHistory() {
  try {
    const data = await safeFetchJson(
      `${API_BASE}/quiz/history`,
      undefined,
      'Failed to fetch quiz history'
    );
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_QUIZ_ATTEMPTS, JSON.stringify(data.attempts));
    } catch {}
    return data.attempts;
  } catch (err) {
    console.warn('Backend fetch quiz history failed, reading from localStorage:', err);
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY_QUIZ_ATTEMPTS);
      if (local) return JSON.parse(local);
    } catch {}
    return [];
  }
}

export async function fetchQuizAttemptById(attemptId) {
  try {
    const data = await safeFetchJson(
      `${API_BASE}/quiz/attempt/${attemptId}`,
      undefined,
      'Failed to fetch attempt details'
    );
    return data.attempt;
  } catch (err) {
    const history = await fetchQuizHistory();
    const found = history.find(a => a.id === attemptId);
    if (found) return found;
    throw new Error('Attempt not found');
  }
}

export async function deleteQuizAttempt(attemptId) {
  try {
    await safeFetchJson(`${API_BASE}/quiz/attempt/${attemptId}`, { method: 'DELETE' }, 'Failed to delete attempt');
  } catch (err) {
    console.warn('Backend delete failed, removing locally:', err);
  }
  try {
    const existingRaw = localStorage.getItem(LOCAL_STORAGE_KEY_QUIZ_ATTEMPTS);
    if (existingRaw) {
      const existing = JSON.parse(existingRaw);
      localStorage.setItem(LOCAL_STORAGE_KEY_QUIZ_ATTEMPTS, JSON.stringify(existing.filter(a => a.id !== attemptId)));
    }
  } catch {}
}

export async function fetchWeakQuestionAnalysis(minAttempts = 2) {
  try {
    const data = await safeFetchJson(
      `${API_BASE}/quiz/weak-question?minAttempts=${minAttempts}`,
      undefined,
      'Failed to fetch weak question analysis'
    );
    return data.analysis;
  } catch (err) {
    console.warn('Failed to fetch weak question analysis from backend:', err);
    return {
      hasSufficientData: false,
      minAttemptsRequired: minAttempts,
      totalAttemptsAnalyzed: 0,
      mostDifficultQuestion: null,
      rankedQuestions: []
    };
  }
}

export async function explainWeakConcept(params) {
  return safeFetchJson(
    `${API_BASE}/quiz/explain-concept`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    },
    'Failed to generate concept explanation'
  );
}
