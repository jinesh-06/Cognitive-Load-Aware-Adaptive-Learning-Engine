/**
 * Cognitive Load-Aware Adaptive Learning Engine
 * Core TypeScript Definitions
 */

export type CognitiveLoadState = 'LOW' | 'MEDIUM' | 'HIGH';

export const COGNITIVE_LOAD_STATES = {
  LOW: 'LOW' as const,
  MEDIUM: 'MEDIUM' as const,
  HIGH: 'HIGH' as const,
};

export const ADAPTATION_LEVELS = {
  STANDARD: 1 as const,
  SIMPLIFIED: 2 as const,
  MAXIMUM_SCAFFOLDING: 3 as const,
};

export const SOURCE_TYPES = {
  OPENSTAX: 'OpenStax' as const,
  ARXIV: 'arXiv' as const,
  TEXTBOOK: 'Textbook' as const,
  USER_UPLOAD: 'UserUpload' as const,
};

export interface BehavioralFeatures {
  time_per_page: number;
  scroll_speed: number;
  number_of_re_reads: number;
  backtracking_count: number;
  quiz_hesitation_time: number;
  quiz_attempts: number;
  quiz_accuracy: number;
  session_duration: number;
}

export interface QuizQuestion {
  id: string;
  topicId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface LessonTopic {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  summary: string;
  originalContent: {
    overview: string;
    mathematicalFormula?: string;
    technicalDetails: string[];
    standardExplanation: string;
  };
  quiz: QuizQuestion[];
}

export interface RAGDocumentChunk {
  id: string;
  source: string;
  sourceType: string;
  topicId: string;
  title: string;
  content: string;
  tags: string[];
  relevanceScore?: number;
}

export interface AdaptedContent {
  topicId: string;
  cognitiveLoad: CognitiveLoadState;
  adaptationLevel: number;
  title: string;
  summary: string;
  coreExplanation: string;
  analogy?: string;
  concreteExample?: string;
  stepByStep?: string[];
  keyTakeaways: string[];
  ragSourcesUsed: {
    title: string;
    source: string;
    excerpt: string;
  }[];
  scaffoldingNotes: string;
  generatedBy: string;
}

export interface PredictionResult {
  cognitive_load: CognitiveLoadState;
  confidence: number;
  probabilities: Record<string, number>;
  featureContributions?: {
    feature: string;
    name: string;
    rawValue: number;
    normalizedValue: number;
    weight: number;
    direction: string;
    explanation: string;
  }[];
  modelUsed?: string;
  timestamp?: string;
}

export interface ConceptExplanationResult {
  concept: string;
  topic: string;
  cognitiveLoad: CognitiveLoadState;
  explanation: string;
  analogy?: string;
  example: string;
  keyPoint: string;
  stepByStep?: string[];
  ragSourcesUsed: {
    title: string;
    source: string;
    excerpt: string;
  }[];
  generatedBy: string;
}

export interface AdaptationHistoryItem {
  id: string;
  timestamp: string;
  topicId: string;
  topicTitle: string;
  previousLoad?: CognitiveLoadState;
  predictedLoad: CognitiveLoadState;
  confidence: number;
  triggerReason: string;
  featuresSnapshot: BehavioralFeatures;
  adaptationSummary: string;
}

export interface LoadHistoryItem {
  timestamp: string;
  load: CognitiveLoadState;
  confidence: number;
  topicId: string;
}

export interface QuizHistoryItem {
  timestamp: string;
  topicId: string;
  score: number;
  hesitationTime: number;
  attempts: number;
}

export interface LearnerAnalytics {
  studentName: string;
  currentLessonId: string;
  learningProgress: number;
  totalTimeSpentSeconds: number;
  totalReReads: number;
  totalBacktracks: number;
  totalQuizAttempts: number;
  averageQuizAccuracy: number;
  currentLoad: CognitiveLoadState;
  currentConfidence: number;
  adaptationHistory: AdaptationHistoryItem[];
  loadHistory: LoadHistoryItem[];
  quizHistory: QuizHistoryItem[];
}

export interface ModelMetrics {
  modelName: string;
  totalSamples: number;
  trainSamples: number;
  testSamples: number;
  accuracy: number;
  precision: Record<string, number>;
  recall: Record<string, number>;
  f1Score: Record<string, number>;
  confusionMatrix: {
    labels: string[];
    matrix: number[][];
  };
  featureImportance: {
    feature: string;
    name: string;
    importance: number;
  }[];
  trainedAt: string;
}

export interface QuizQuestionAttemptResult {
  questionId: string;
  question: string;
  selectedOption: number;
  selectedAnswer: string;
  correctIndex: number;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  concept: string;
  hesitationSec: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  topicId: string;
  topic: string;
  date: string;
  timestamp: number;
  score: number;
  total: number;
  percentage: number;
  timeTaken: number;
  cognitiveLoadAtSubmission: CognitiveLoadState;
  confidenceAtSubmission: number;
  questions: QuizQuestionAttemptResult[];
}

export interface QuestionAnalyticsItem {
  questionId: string;
  question: string;
  topicId: string;
  topicTitle: string;
  relatedConcept: string;
  totalAttempts: number;
  wrongAttempts: number;
  correctAttempts: number;
  lastUserAnswer: string;
  correctAnswer: string;
  explanation: string;
  errorRate: number;
  errorPercentage: number;
}

export interface ConceptProgression {
  concept: string;
  initialAccuracy: number;
  currentAccuracy: number;
  improvementPercentage: number;
  accuracyHistory: {
    attemptIndex: number;
    date: string;
    accuracy: number;
    topic: string;
  }[];
}

export interface WeakQuestionAnalysis {
  hasSufficientData: boolean;
  minAttemptsRequired: number;
  totalAttemptsAnalyzed: number;
  mostDifficultQuestion: QuestionAnalyticsItem | null;
  rankedQuestions: QuestionAnalyticsItem[];
  conceptProgression?: ConceptProgression;
}
