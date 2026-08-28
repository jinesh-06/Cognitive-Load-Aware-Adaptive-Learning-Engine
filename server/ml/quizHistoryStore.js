// In-memory persistent storage for quiz attempts
let quizAttemptsStore = [
  {
    id: 'att-seed-01',
    quizId: 'backpropagation',
    topicId: 'backpropagation',
    topic: 'Backpropagation & Gradient Flow',
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString().split('T')[0],
    timestamp: Date.now() - 1000 * 60 * 60 * 48,
    score: 1,
    total: 3,
    percentage: 33,
    timeTaken: 185,
    cognitiveLoadAtSubmission: 'HIGH',
    confidenceAtSubmission: 0.88,
    questions: [
      {
        questionId: 'bp-q1',
        question: 'What is the primary role of the Chain Rule in backpropagation?',
        selectedOption: 2,
        selectedAnswer: 'To initialize the random weight matrices before training',
        correctIndex: 0,
        correctAnswer: 'To compute the partial derivatives of the loss with respect to each weight layer by layer',
        isCorrect: false,
        explanation: 'The chain rule computes intermediate gradients layer-by-layer backwards.',
        concept: 'Chain Rule & Backpropagation',
        hesitationSec: 24
      },
      {
        questionId: 'bp-q2',
        question: 'If the gradients become exponentially small as they propagate backwards, what issue occurs?',
        selectedOption: 0,
        selectedAnswer: 'Vanishing Gradient Problem',
        correctIndex: 0,
        correctAnswer: 'Vanishing Gradient Problem',
        isCorrect: true,
        explanation: 'Vanishing gradient occurs when continuous multiplication of small numbers dampens the update signal.',
        concept: 'Vanishing Gradient',
        hesitationSec: 10
      },
      {
        questionId: 'bp-q3',
        question: 'What happens if the learning rate is set too large during gradient descent?',
        selectedOption: 0,
        selectedAnswer: 'The weights will quickly converge to zero',
        correctIndex: 1,
        correctAnswer: 'The optimizer can overshoot the global minimum and diverge',
        isCorrect: false,
        explanation: 'Excessive step sizes cause oscillations and divergence.',
        concept: 'Learning Rate Optimization',
        hesitationSec: 32
      }
    ]
  },
  {
    id: 'att-seed-02',
    quizId: 'neural-networks',
    topicId: 'neural-networks',
    topic: 'Neural Networks & Deep Architectures',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().split('T')[0],
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    score: 2,
    total: 3,
    percentage: 67,
    timeTaken: 140,
    cognitiveLoadAtSubmission: 'MEDIUM',
    confidenceAtSubmission: 0.82,
    questions: [
      {
        questionId: 'nn-q1',
        question: 'What is the primary purpose of non-linear activation functions in deep networks?',
        selectedOption: 0,
        selectedAnswer: 'To enable the network to learn non-linear decision boundaries and complex mappings',
        correctIndex: 0,
        correctAnswer: 'To enable the network to learn non-linear decision boundaries and complex mappings',
        isCorrect: true,
        explanation: 'Non-linearities prevent deep networks from collapsing into a single linear matrix.',
        concept: 'Activation Functions & Non-Linearity',
        hesitationSec: 12
      },
      {
        questionId: 'bp-q1',
        question: 'What is the primary role of the Chain Rule in backpropagation?',
        selectedOption: 1,
        selectedAnswer: 'To calculate the forward activation pass for inputs',
        correctIndex: 0,
        correctAnswer: 'To compute the partial derivatives of the loss with respect to each weight layer by layer',
        isCorrect: false,
        explanation: 'The chain rule computes intermediate gradients layer-by-layer backwards.',
        concept: 'Chain Rule & Backpropagation',
        hesitationSec: 28
      },
      {
        questionId: 'nn-q3',
        question: 'Why is Dropout regularization effective in preventing overfitting in dense layers?',
        selectedOption: 1,
        selectedAnswer: 'It randomly deactivates neurons during forward pass to prevent co-adaptation',
        correctIndex: 1,
        correctAnswer: 'It randomly deactivates neurons during forward pass to prevent co-adaptation',
        isCorrect: true,
        explanation: 'Dropout forces redundant sub-networks to learn robust features.',
        concept: 'Regularization & Dropout',
        hesitationSec: 15
      }
    ]
  },
  {
    id: 'att-seed-03',
    quizId: 'linear-regression',
    topicId: 'linear-regression',
    topic: 'Linear Regression & Cost Functions',
    date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString().split('T')[0],
    timestamp: Date.now() - 1000 * 60 * 60 * 12,
    score: 3,
    total: 3,
    percentage: 100,
    timeTaken: 95,
    cognitiveLoadAtSubmission: 'LOW',
    confidenceAtSubmission: 0.94,
    questions: [
      {
        questionId: 'lr-q1',
        question: 'In Ordinary Least Squares (OLS) regression, what does the Mean Squared Error (MSE) measure?',
        selectedOption: 0,
        selectedAnswer: 'Average squared difference between predicted values and actual ground-truth targets',
        correctIndex: 0,
        correctAnswer: 'Average squared difference between predicted values and actual ground-truth targets',
        isCorrect: true,
        explanation: 'MSE quantifies Euclidean variance between predictions and targets.',
        concept: 'Loss Functions & MSE',
        hesitationSec: 8
      },
      {
        questionId: 'bp-q3',
        question: 'What happens if the learning rate is set too large during gradient descent?',
        selectedOption: 1,
        selectedAnswer: 'The optimizer can overshoot the global minimum and diverge',
        correctIndex: 1,
        correctAnswer: 'The optimizer can overshoot the global minimum and diverge',
        isCorrect: true,
        explanation: 'Correct! Large learning rates cause oscillation.',
        concept: 'Learning Rate Optimization',
        hesitationSec: 14
      },
      {
        questionId: 'lr-q3',
        question: 'What is the primary difference between L1 (Lasso) and L2 (Ridge) regularization penalties?',
        selectedOption: 0,
        selectedAnswer: 'L1 adds absolute weight penalties promoting sparsity, while L2 adds squared penalties',
        correctIndex: 0,
        correctAnswer: 'L1 adds absolute weight penalties promoting sparsity, while L2 adds squared penalties',
        isCorrect: true,
        explanation: 'L1 produces exact zero weights, yielding sparse feature selection.',
        concept: 'Regularization & Sparsity',
        hesitationSec: 9
      }
    ]
  }
];

export const quizHistoryStore = {
  getAllAttempts() {
    return [...quizAttemptsStore].sort((a, b) => b.timestamp - a.timestamp);
  },

  getAttemptById(id) {
    return quizAttemptsStore.find(a => a.id === id);
  },

  addAttempt(attempt) {
    const newAttempt = {
      ...attempt,
      id: attempt.id || `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: attempt.timestamp || Date.now(),
      date: attempt.date || new Date().toISOString().split('T')[0]
    };
    quizAttemptsStore.unshift(newAttempt);
    return newAttempt;
  },

  deleteAttempt(id) {
    const initialLen = quizAttemptsStore.length;
    quizAttemptsStore = quizAttemptsStore.filter(a => a.id !== id);
    return quizAttemptsStore.length < initialLen;
  },

  clearAll() {
    quizAttemptsStore = [];
  },

  analyzeWeakQuestions(minAttemptsRequired = 2) {
    const attempts = quizAttemptsStore;
    const questionStatsMap = new Map();

    // Loop through all saved attempts and all questions
    for (const att of attempts) {
      for (const q of att.questions || []) {
        const key = q.questionId || q.question;
        const existing = questionStatsMap.get(key);

        if (existing) {
          existing.totalAttempts += 1;
          if (q.isCorrect) {
            existing.correctAttempts += 1;
          } else {
            existing.wrongAttempts += 1;
            existing.lastUserAnswer = q.selectedAnswer;
          }
          if (q.correctAnswer) existing.correctAnswer = q.correctAnswer;
          if (q.explanation) existing.explanation = q.explanation;
          if (q.concept) existing.relatedConcept = q.concept;
        } else {
          questionStatsMap.set(key, {
            questionId: q.questionId,
            question: q.question,
            topicId: att.topicId,
            topicTitle: att.topic,
            relatedConcept: q.concept || inferConcept(q.question, att.topic),
            totalAttempts: 1,
            wrongAttempts: q.isCorrect ? 0 : 1,
            correctAttempts: q.isCorrect ? 1 : 0,
            lastUserAnswer: q.selectedAnswer,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation
          });
        }
      }
    }

    // Convert map to array and calculate error rates
    const questionItems = Array.from(questionStatsMap.values()).map(item => {
      const errorRate = item.totalAttempts > 0 ? item.wrongAttempts / item.totalAttempts : 0;
      return {
        ...item,
        errorRate: Number(errorRate.toFixed(3)),
        errorPercentage: Math.round(errorRate * 100)
      };
    });

    questionItems.sort((a, b) => {
      if (b.errorRate !== a.errorRate) {
        return b.errorRate - a.errorRate;
      }
      return b.totalAttempts - a.totalAttempts;
    });

    const eligibleQuestions = questionItems.filter(q => q.totalAttempts >= minAttemptsRequired);

    let mostDifficultQuestion = null;
    let hasSufficientData = false;

    if (eligibleQuestions.length > 0) {
      mostDifficultQuestion = eligibleQuestions[0];
      hasSufficientData = true;
    } else if (questionItems.length > 0) {
      hasSufficientData = false;
      mostDifficultQuestion = null;
    }

    const chronologicalAttempts = [...attempts].sort((a, b) => a.timestamp - b.timestamp);
    const targetConcept = mostDifficultQuestion?.relatedConcept || 'General ML Concepts';

    const accuracyHistory = chronologicalAttempts.map((att, idx) => ({
      attemptIndex: idx + 1,
      date: att.date,
      accuracy: att.percentage,
      topic: att.topic
    }));

    const initialAccuracy = accuracyHistory.length > 0 ? accuracyHistory[0].accuracy : 0;
    const currentAccuracy = accuracyHistory.length > 0 ? accuracyHistory[accuracyHistory.length - 1].accuracy : 0;
    const improvementPercentage = currentAccuracy - initialAccuracy;

    return {
      hasSufficientData,
      minAttemptsRequired,
      totalAttemptsAnalyzed: attempts.length,
      mostDifficultQuestion,
      rankedQuestions: questionItems,
      conceptProgression: {
        concept: targetConcept,
        initialAccuracy,
        currentAccuracy,
        improvementPercentage,
        accuracyHistory
      }
    };
  }
};

function inferConcept(question, topic) {
  const qLower = (question || '').toLowerCase();
  if (qLower.includes('chain rule') || qLower.includes('backprop')) return 'Chain Rule & Backpropagation';
  if (qLower.includes('overfit') || qLower.includes('generaliz')) return 'Overfitting & Generalization';
  if (qLower.includes('vanishing') || qLower.includes('exploding')) return 'Vanishing Gradient';
  if (qLower.includes('learning rate') || qLower.includes('step size')) return 'Learning Rate Optimization';
  if (qLower.includes('activation') || qLower.includes('relu')) return 'Activation Functions';
  if (qLower.includes('dropout') || qLower.includes('regulariz')) return 'Regularization & Dropout';
  if (qLower.includes('mse') || qLower.includes('least squares')) return 'Loss Functions & MSE';
  return `${topic || 'Topic'} Foundations`;
}
