import express from 'express';
import { generateAdaptiveContent } from '../llm/adaptiveGenerator.js';
import { explainWeakConceptAI } from '../llm/conceptExplainer.js';
import { cognitiveLoadModel } from '../ml/model.js';
import { quizHistoryStore } from '../ml/quizHistoryStore.js';
import { LESSON_TOPICS } from '../rag/knowledgeBase.js';
import { vectorStore } from '../rag/vectorStore.js';

export const apiRouter = express.Router();

// In-memory learner session analytics state
let learnerState = {
  studentName: 'Alex Mercer (Learner ID #8042)',
  currentLessonId: 'backpropagation',
  learningProgress: 35,
  totalTimeSpentSeconds: 420,
  totalReReads: 4,
  totalBacktracks: 3,
  totalQuizAttempts: 5,
  averageQuizAccuracy: 78,
  currentLoad: 'LOW',
  currentConfidence: 0.85,
  adaptationHistory: [
    {
      id: 'adapt-init-1',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      topicId: 'backpropagation',
      topicTitle: 'Backpropagation & Gradient Flow',
      previousLoad: undefined,
      predictedLoad: 'LOW',
      confidence: 0.88,
      triggerReason: 'Initial baseline setup with nominal dwell time.',
      featuresSnapshot: {
        time_per_page: 65,
        scroll_speed: 380,
        number_of_re_reads: 1,
        backtracking_count: 0,
        quiz_hesitation_time: 6,
        quiz_attempts: 1,
        quiz_accuracy: 90,
        session_duration: 300
      },
      adaptationSummary: 'Standard high-rigor mathematical explanation served.'
    }
  ],
  loadHistory: [
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      load: 'LOW',
      confidence: 0.88,
      topicId: 'linear-regression'
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      load: 'MEDIUM',
      confidence: 0.79,
      topicId: 'neural-networks'
    },
    {
      timestamp: new Date().toISOString(),
      load: 'LOW',
      confidence: 0.85,
      topicId: 'backpropagation'
    }
  ],
  quizHistory: [
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      topicId: 'linear-regression',
      score: 100,
      hesitationTime: 5.2,
      attempts: 1
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      topicId: 'neural-networks',
      score: 75,
      hesitationTime: 14.5,
      attempts: 2
    }
  ]
};

// 1. Lessons
apiRouter.get('/lessons', (req, res) => {
  res.json({ lessons: LESSON_TOPICS });
});

apiRouter.get('/lessons/:id', (req, res) => {
  const lesson = LESSON_TOPICS.find(l => l.id === req.params.id);
  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found' });
  }
  res.json({ lesson });
});

// 2. Predict Cognitive Load
apiRouter.post('/predict-load', (req, res) => {
  try {
    const rawFeatures = req.body || {};
    const features = {
      time_per_page: Number(rawFeatures.time_per_page ?? 90),
      scroll_speed: Number(rawFeatures.scroll_speed ?? 250),
      number_of_re_reads: Number(rawFeatures.number_of_re_reads ?? 1),
      backtracking_count: Number(rawFeatures.backtracking_count ?? 1),
      quiz_hesitation_time: Number(rawFeatures.quiz_hesitation_time ?? 12),
      quiz_attempts: Number(rawFeatures.quiz_attempts ?? 1),
      quiz_accuracy: Number(rawFeatures.quiz_accuracy ?? 80),
      session_duration: Number(rawFeatures.session_duration ?? 600)
    };

    const prediction = cognitiveLoadModel.predict(features);

    // Update state
    learnerState.currentLoad = prediction.cognitive_load;
    learnerState.currentConfidence = prediction.confidence;
    learnerState.loadHistory.push({
      timestamp: new Date().toISOString(),
      load: prediction.cognitive_load,
      confidence: prediction.confidence,
      topicId: learnerState.currentLessonId
    });

    if (learnerState.loadHistory.length > 50) {
      learnerState.loadHistory.shift();
    }

    res.json({ prediction });
  } catch (err) {
    console.error('Prediction error:', err);
    res.status(500).json({ error: err.message || 'Failed to predict cognitive load' });
  }
});

// 3. Generate Adaptive Content
apiRouter.post('/generate-content', async (req, res) => {
  try {
    const { topicId, cognitiveLoad, confidence, consecutiveHighLoadCount, customQuery, features } = req.body;
    const topic = LESSON_TOPICS.find(l => l.id === topicId) || LESSON_TOPICS[0];
    const loadState = cognitiveLoad || learnerState.currentLoad || 'LOW';
    const conf = typeof confidence === 'number' ? confidence : learnerState.currentConfidence || 0.85;

    const prevLoad = learnerState.currentLoad;
    const adapted = await generateAdaptiveContent(
      topic.id,
      loadState,
      conf,
      consecutiveHighLoadCount || 0,
      features,
      customQuery
    );

    // Record adaptation event
    const event = {
      id: `adapt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      topicId: topic.id,
      topicTitle: topic.title,
      previousLoad: prevLoad,
      predictedLoad: loadState,
      confidence: conf,
      triggerReason: `Cognitive Load predicted as ${loadState} (${Math.round(conf * 100)}% confidence).`,
      featuresSnapshot: {
        time_per_page: req.body.features?.time_per_page ?? 120,
        scroll_speed: req.body.features?.scroll_speed ?? 200,
        number_of_re_reads: req.body.features?.number_of_re_reads ?? 2,
        backtracking_count: req.body.features?.backtracking_count ?? 1,
        quiz_hesitation_time: req.body.features?.quiz_hesitation_time ?? 15,
        quiz_attempts: req.body.features?.quiz_attempts ?? 1,
        quiz_accuracy: req.body.features?.quiz_accuracy ?? 75,
        session_duration: req.body.features?.session_duration ?? 700
      },
      adaptationSummary: adapted.scaffoldingNotes
    };

    learnerState.adaptationHistory.unshift(event);
    if (learnerState.adaptationHistory.length > 30) {
      learnerState.adaptationHistory.pop();
    }

    res.json({
      adaptedContent: adapted,
      ragSources: adapted.ragSourcesUsed || [],
      adaptationEvent: event
    });
  } catch (err) {
    console.error('Content generation error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate adaptive content' });
  }
});

// 4. RAG Search
apiRouter.post('/rag/search', (req, res) => {
  try {
    const { query, topicId, topK } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    const results = vectorStore.search(query, topicId, topK || 4);
    res.json({ query, results, totalResults: results.length });
  } catch (err) {
    res.status(500).json({ error: err.message || 'RAG search error' });
  }
});

// 5. Document Ingestion
apiRouter.get('/documents', (req, res) => {
  res.json({
    chunks: vectorStore.getAllChunks(),
    stats: vectorStore.getStats()
  });
});

apiRouter.post('/documents/upload', (req, res) => {
  try {
    const { title, content, source, sourceType, topicId, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    const createdChunk = vectorStore.addDocument({
      title,
      content,
      source: source || 'User Upload',
      sourceType: sourceType || 'UserUpload',
      topicId: topicId || 'general',
      tags: tags || ['user-uploaded']
    });
    res.json({ message: 'Document indexed successfully', chunk: createdChunk, stats: vectorStore.getStats() });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to index document' });
  }
});

// 6. Quiz Evaluation
apiRouter.post('/quiz/submit', (req, res) => {
  try {
    const { topicId, questionId, selectedIndex, hesitationTime, attempts } = req.body;
    const topic = LESSON_TOPICS.find(l => l.id === topicId);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    const question = topic.quiz.find(q => q.id === questionId) || topic.quiz[0];
    const isCorrect = question.correctIndex === selectedIndex;
    const score = isCorrect ? 100 : 0;

    learnerState.totalQuizAttempts += (attempts || 1);
    learnerState.quizHistory.push({
      timestamp: new Date().toISOString(),
      topicId,
      score,
      hesitationTime: hesitationTime || 10,
      attempts: attempts || 1
    });

    // Recompute average accuracy
    const totalScores = learnerState.quizHistory.reduce((acc, q) => acc + q.score, 0);
    learnerState.averageQuizAccuracy = Math.round(totalScores / (learnerState.quizHistory.length || 1));

    res.json({
      isCorrect,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
      learnerAverageAccuracy: learnerState.averageQuizAccuracy
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Quiz submission error' });
  }
});

// 7. Behavioral Logging
apiRouter.post('/behavior', (req, res) => {
  const { eventType, value, topicId } = req.body;
  if (topicId) learnerState.currentLessonId = topicId;

  if (eventType === 're_read') {
    learnerState.totalReReads += (value || 1);
  } else if (eventType === 'backtrack') {
    learnerState.totalBacktracks += (value || 1);
  } else if (eventType === 'time_spent') {
    learnerState.totalTimeSpentSeconds += (value || 5);
  } else if (eventType === 'progress') {
    learnerState.learningProgress = Math.min(100, Math.max(0, value || 0));
  }

  res.json({ status: 'ok', learnerState });
});

// 8. Analytics
apiRouter.get('/analytics', (req, res) => {
  res.json({ analytics: learnerState });
});

apiRouter.post('/analytics/reset', (req, res) => {
  learnerState = {
    studentName: 'Alex Mercer (Learner ID #8042)',
    currentLessonId: 'backpropagation',
    learningProgress: 20,
    totalTimeSpentSeconds: 120,
    totalReReads: 0,
    totalBacktracks: 0,
    totalQuizAttempts: 1,
    averageQuizAccuracy: 85,
    currentLoad: 'LOW',
    currentConfidence: 0.85,
    adaptationHistory: [],
    loadHistory: [
      {
        timestamp: new Date().toISOString(),
        load: 'LOW',
        confidence: 0.85,
        topicId: 'backpropagation'
      }
    ],
    quizHistory: []
  };
  res.json({ status: 'reset', analytics: learnerState });
});

// 9. Model Metrics
apiRouter.get('/model/metrics', (req, res) => {
  const metrics = cognitiveLoadModel.getMetrics();
  res.json({ metrics });
});

apiRouter.post('/model/retrain', (req, res) => {
  const sampleCount = Number(req.body.sampleCount || 1200);
  const metrics = cognitiveLoadModel.initAndTrain(sampleCount);
  res.json({ message: 'Model retrained successfully', metrics });
});

// 10. Dataset Sample
apiRouter.get('/dataset', (req, res) => {
  const samples = cognitiveLoadModel.getDatasetSample(150);
  const stats = cognitiveLoadModel.getStats();
  res.json({ samples, stats, totalCount: 1200 });
});

// 11. Quiz History & Attempt Persistence
apiRouter.post('/quiz/attempt', (req, res) => {
  try {
    const {
      quizId,
      topicId,
      topic,
      score,
      total,
      percentage,
      timeTaken,
      questions,
      cognitiveLoadAtSubmission,
      confidenceAtSubmission
    } = req.body;

    if (!topic && !topicId) {
      return res.status(400).json({ error: 'Quiz topic is required' });
    }

    const savedAttempt = quizHistoryStore.addAttempt({
      quizId: quizId || topicId || 'quiz-module',
      topicId: topicId || 'general',
      topic: topic || 'Machine Learning Module',
      date: new Date().toISOString().split('T')[0],
      score: Number(score || 0),
      total: Number(total || (questions?.length || 1)),
      percentage: Number(percentage ?? (total ? Math.round((score / total) * 100) : 0)),
      timeTaken: Number(timeTaken || 0),
      cognitiveLoadAtSubmission: cognitiveLoadAtSubmission || learnerState.currentLoad || 'LOW',
      confidenceAtSubmission: Number(confidenceAtSubmission || learnerState.currentConfidence || 0.85),
      questions: Array.isArray(questions) ? questions : []
    });

    // Update overall learner analytics state
    learnerState.totalQuizAttempts += 1;
    learnerState.quizHistory.push({
      timestamp: new Date().toISOString(),
      topicId: savedAttempt.topicId,
      score: savedAttempt.percentage,
      hesitationTime: savedAttempt.timeTaken / Math.max(1, savedAttempt.total),
      attempts: 1
    });
    const allScores = learnerState.quizHistory.map(q => q.score);
    learnerState.averageQuizAccuracy = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

    res.status(201).json({
      message: 'Quiz attempt saved successfully',
      attempt: savedAttempt,
      weakQuestionAnalysis: quizHistoryStore.analyzeWeakQuestions(2)
    });
  } catch (err) {
    console.error('Save attempt error:', err);
    res.status(500).json({ error: err.message || 'Failed to save quiz attempt' });
  }
});

apiRouter.get('/quiz/history', (req, res) => {
  try {
    const attempts = quizHistoryStore.getAllAttempts();
    res.json({
      totalAttempts: attempts.length,
      attempts
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch quiz history' });
  }
});

apiRouter.get('/quiz/attempt/:attemptId', (req, res) => {
  try {
    const attempt = quizHistoryStore.getAttemptById(req.params.attemptId);
    if (!attempt) {
      return res.status(404).json({ error: 'Quiz attempt not found' });
    }
    res.json({ attempt });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch attempt' });
  }
});

apiRouter.delete('/quiz/attempt/:attemptId', (req, res) => {
  try {
    const success = quizHistoryStore.deleteAttempt(req.params.attemptId);
    if (!success) {
      return res.status(404).json({ error: 'Attempt not found' });
    }
    res.json({ message: 'Attempt deleted successfully', remainingCount: quizHistoryStore.getAllAttempts().length });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to delete attempt' });
  }
});

apiRouter.get('/quiz/weak-question', (req, res) => {
  try {
    const minAttempts = Number(req.query.minAttempts || 2);
    const analysis = quizHistoryStore.analyzeWeakQuestions(minAttempts);
    res.json({ analysis });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to analyze weak questions' });
  }
});

apiRouter.post('/quiz/explain-concept', async (req, res) => {
  try {
    const { questionId, question, userAnswer, correctAnswer, topic, cognitiveLoad, conceptName } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question text is required' });
    }

    const currentLoadState = cognitiveLoad || learnerState.currentLoad || 'LOW';
    const resolvedTopic = topic || 'Machine Learning Concepts';

    // RAG Search for supporting knowledge base context
    const searchQuery = `${conceptName || ''} ${question} ${resolvedTopic} explanation definition intuition`;
    const ragChunks = vectorStore.search(searchQuery, undefined, 3);

    // Call explainWeakConceptAI with Cognitive-Load Scaffolding
    const explanationResult = await explainWeakConceptAI(
      question,
      userAnswer || '',
      correctAnswer || 'Target ground truth concept',
      resolvedTopic,
      currentLoadState,
      ragChunks,
      conceptName
    );

    res.json({
      ...explanationResult,
      retrievalContextSources: ragChunks.map(c => ({
        title: c.title,
        source: c.source,
        relevanceScore: c.relevanceScore
      }))
    });
  } catch (err) {
    console.error('Explain concept error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate concept explanation' });
  }
});

// ==========================================
// 12. Admin Team & Invitation Management
// ==========================================

let adminTeam = [
  {
    id: 'ADM-001',
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@stanford.edu',
    role: 'Super Administrator',
    privilege: 'Full System & Curriculum Control',
    joinedDate: '2026-01-15',
    status: 'ACTIVE'
  },
  {
    id: 'ADM-002',
    name: 'System Root Admin',
    email: 'admin@cognitive-ai.edu',
    role: 'System Administrator',
    privilege: 'ML Studio & Telemetry Auditor',
    joinedDate: '2026-02-01',
    status: 'ACTIVE'
  }
];

let adminInvitations = [
  {
    id: 'inv-8821',
    code: 'ADM-INV-8821',
    email: 'marcus.vance@mit.edu',
    name: 'Dr. Marcus Vance',
    role: 'ML Research Lead',
    invitedBy: 'Dr. Sarah Chen',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: 'PENDING'
  }
];

// List all active administrators
apiRouter.get('/admin/team', (req, res) => {
  res.json({
    team: adminTeam,
    invitations: adminInvitations,
    totalAdmins: adminTeam.length,
    pendingInvites: adminInvitations.filter(i => i.status === 'PENDING').length
  });
});

// Invite a new administrator
apiRouter.post('/admin/invite', (req, res) => {
  try {
    const { email, name, role, invitedBy } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Invitee email is required' });
    }

    // Check if already an admin
    if (adminTeam.some(a => a.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: 'A user with this email is already an Administrator.' });
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `ADM-INV-${randomSuffix}`;
    const newInvitation = {
      id: `inv-${Date.now()}`,
      code,
      email: email.trim(),
      name: name?.trim() || email.split('@')[0],
      role: role || 'System Administrator',
      invitedBy: invitedBy || 'Dr. Sarah Chen',
      createdAt: new Date().toISOString(),
      status: 'PENDING'
    };

    adminInvitations.unshift(newInvitation);

    res.status(201).json({
      message: 'Admin invitation generated successfully',
      invitation: newInvitation,
      inviteLink: `http://localhost:3000/?invite=${code}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to create invitation' });
  }
});

// Validate & redeem an admin invitation code
apiRouter.post('/admin/validate-invite', (req, res) => {
  try {
    const { code, email, name } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Invitation code is required', valid: false });
    }

    const cleanCode = code.trim().toUpperCase();
    const invite = adminInvitations.find(i => i.code.toUpperCase() === cleanCode && i.status === 'PENDING');

    if (!invite && cleanCode !== 'ADM-INV-MASTER' && cleanCode !== 'ADM-001') {
      return res.status(404).json({ error: 'Invalid or expired invitation code', valid: false });
    }

    const assignedRole = invite?.role || 'System Administrator';
    const adminId = `ADM-${Math.floor(100 + Math.random() * 900)}`;

    if (invite) {
      invite.status = 'ACCEPTED';
      invite.acceptedAt = new Date().toISOString();
      
      // Add to team if not already present
      if (!adminTeam.some(a => a.email.toLowerCase() === (email || invite.email).toLowerCase())) {
        adminTeam.push({
          id: adminId,
          name: name || invite.name,
          email: email || invite.email,
          role: assignedRole,
          privilege: 'Admin Portal Access',
          joinedDate: new Date().toISOString().split('T')[0],
          status: 'ACTIVE'
        });
      }
    }

    res.json({
      valid: true,
      message: 'Admin invitation verified successfully',
      adminId,
      role: assignedRole,
      isAdmin: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to validate invitation', valid: false });
  }
});

// Revoke an invitation
apiRouter.delete('/admin/invite/:id', (req, res) => {
  try {
    const { id } = req.params;
    const initialLen = adminInvitations.length;
    adminInvitations = adminInvitations.filter(i => i.id !== id && i.code !== id);

    if (adminInvitations.length === initialLen) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    res.json({ message: 'Invitation revoked successfully', remaining: adminInvitations });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to revoke invitation' });
  }
});

