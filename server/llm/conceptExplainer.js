import { GoogleGenAI } from '@google/genai';

let genAIClient = null;
let lastQuotaExhaustedTimestamp = 0;
const QUOTA_COOLDOWN_MS = 5 * 60 * 1000; // 5 minute cooldown when quota is exhausted

// In-memory cache for concept explanations to prevent redundant API calls
const explanationCache = new Map();

function getGenAI() {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAIClient;
}

export async function explainWeakConceptAI(
  question,
  userAnswer,
  correctAnswer,
  topic,
  cognitiveLoad = 'HIGH',
  ragChunks = [],
  conceptName
) {
  const inferredConcept = conceptName || identifyConceptFromQuestion(question, topic);
  const cacheKey = `${inferredConcept}_${cognitiveLoad}_${(question || '').slice(0, 40)}`;

  if (explanationCache.has(cacheKey)) {
    const cached = explanationCache.get(cacheKey);
    return {
      ...cached,
      ragSourcesUsed: ragChunks.map(c => ({
        title: c.title,
        source: c.source,
        excerpt: c.content.slice(0, 150) + '...'
      }))
    };
  }

  const ragContextText = ragChunks.map(c => `[Source: ${c.source} | Title: ${c.title}]\n${c.content}`).join('\n\n');
  const isCooldownActive = Date.now() - lastQuotaExhaustedTimestamp < QUOTA_COOLDOWN_MS;

  const ai = getGenAI();

  if (ai && !isCooldownActive) {
    const candidateModels = ['gemini-2.5-flash', 'gemini-3.7-flash', 'gemini-3.1-flash-lite'];

    for (const modelName of candidateModels) {
      if (Date.now() - lastQuotaExhaustedTimestamp < QUOTA_COOLDOWN_MS) {
        break;
      }

      try {
        const prompt = `You are an expert cognitive load-aware adaptive AI tutor specializing in Machine Learning and Computer Science.

A student struggled with a quiz question targeting the concept: "${inferredConcept}" in the topic "${topic}".

Student's Status:
- Cognitive Load State: ${cognitiveLoad}
- Question Asked: "${question}"
- Student's Incorrect Choice: "${userAnswer || 'Not provided'}"
- Correct Answer: "${correctAnswer}"

Retrieved Verified Textbook Context (RAG Knowledge):
${ragContextText || 'Use standard pedagogical computer science fundamentals.'}

Pedagogical Scaffolding Instructions:
- Provide an intuitive, targeted conceptual explanation specifically addressing WHY their misconception happened and HOW the concept works.
- For HIGH cognitive load: Use a vivid, relatable everyday analogy, break the logic into simple short numbered steps, and highlight the single most important rule to remember. Avoid dense jargon.
- For MEDIUM load: Balance formal definition with a concrete applied walkthrough.
- For LOW load: Provide precise mathematical/theoretical insight and efficiency considerations.

OUTPUT MUST BE VALID JSON ONLY with this exact schema:
{
  "concept": "${inferredConcept}",
  "explanation": "Clear, direct explanation addressing the core mechanism and why the student's answer was incorrect",
  "analogy": "A vivid everyday metaphor or intuitive physical analogy that grounds the concept",
  "example": "A concrete mini scenario or input-output demonstration",
  "keyPoint": "The single golden takeaway sentence to remember for future quizzes",
  "stepByStep": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ]
}`;

        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          }
        });

        const responseText = response.text;

        if (responseText) {
          const parsed = JSON.parse(responseText);
          const result = {
            concept: parsed.concept || inferredConcept,
            topic,
            cognitiveLoad,
            explanation: parsed.explanation || `Core concept breakdown for ${inferredConcept}.`,
            analogy: parsed.analogy || undefined,
            example: parsed.example || `Example application of ${inferredConcept}.`,
            keyPoint: parsed.keyPoint || `Remember: ${correctAnswer}.`,
            stepByStep: parsed.stepByStep || undefined,
            ragSourcesUsed: ragChunks.map(c => ({
              title: c.title,
              source: c.source,
              excerpt: c.content.slice(0, 150) + '...'
            })),
            generatedBy: modelName
          };

          explanationCache.set(cacheKey, result);
          return result;
        }
      } catch (err) {
        const errorMsg = String(err?.message || err);
        if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
          lastQuotaExhaustedTimestamp = Date.now();
          console.info(`[ConceptExplainer] Gemini free-tier quota reached. Activating cognitive rule-based RAG synthesis fallback.`);
          break;
        } else {
          console.info(`[ConceptExplainer] Note on model ${modelName}: Using resilient adaptive synthesis.`);
        }
      }
    }
  }

  const fallbackResult = generateFallbackExplanation(question, userAnswer, correctAnswer, topic, inferredConcept, cognitiveLoad, ragChunks);
  explanationCache.set(cacheKey, fallbackResult);
  return fallbackResult;
}

function identifyConceptFromQuestion(question, topic) {
  const q = (question || '').toLowerCase();
  if (q.includes('chain rule') || q.includes('backprop')) return 'Chain Rule & Backpropagation';
  if (q.includes('vanishing') || q.includes('exploding')) return 'Vanishing Gradient Problem';
  if (q.includes('learning rate') || q.includes('overshoot') || q.includes('step size')) return 'Learning Rate Optimization';
  if (q.includes('activation') || q.includes('non-linear') || q.includes('relu')) return 'Activation Functions & Non-Linearity';
  if (q.includes('dropout') || q.includes('co-adaptation')) return 'Dropout Regularization';
  if (q.includes('mse') || q.includes('mean squared') || q.includes('least squares')) return 'Loss Functions & Mean Squared Error';
  if (q.includes('lasso') || q.includes('ridge') || q.includes('l1') || q.includes('l2')) return 'L1 vs L2 Regularization & Sparsity';
  if (q.includes('precision') || q.includes('recall') || q.includes('false negative')) return 'Precision, Recall & Classification Metrics';
  if (q.includes('overfit') || q.includes('variance') || q.includes('bias')) return 'Overfitting & Generalization';
  return `${topic} Core Principles`;
}

function generateFallbackExplanation(
  question,
  userAnswer,
  correctAnswer,
  topic,
  concept,
  cognitiveLoad,
  ragChunks
) {
  const analogyMap = {
    'Chain Rule & Backpropagation': 'Think of an assembly line where an inspection team finds a defect at the end. Instead of blaming the entire factory randomly, you trace backwards step-by-step to see exactly which tool or station contributed to the variance.',
    'Vanishing Gradient Problem': 'Imagine a whispered message passed down a chain of 100 people. If each person speaks at 25% volume of the previous person, by the 10th person the signal has dropped to complete inaudible silence.',
    'Learning Rate Optimization': 'Like stepping down a steep mountain trail: taking gigantic 10-meter leaps will cause you to overshoot the path and tumble off cliffs, while microscopic millimeter steps take forever to reach camp.',
    'Activation Functions & Non-Linearity': 'Stacking 10 flat panes of glass together still produces a flat surface. Non-linear activation functions are like folding or curving the glass so the neural network can wrap around complex shapes.',
    'Dropout Regularization': 'Like a sports coach practicing without their star player on alternating days: the entire team learns independent skills rather than relying on a single individual.',
    'Loss Functions & Mean Squared Error': 'Like measuring how far darts land from the bullseye: squaring the distance heavily penalizes extreme misses compared to minor near-misses.',
    'L1 vs L2 Regularization & Sparsity': 'L1 Lasso is like a strict editor who deletes unnecessary words entirely (weights go to zero), while L2 Ridge gently reduces font size for everything without deleting any words.'
  };

  const analogy = analogyMap[concept] ||
    `Consider ${concept} like a feedback control system where each adjustment balances accuracy against simplicity.`;

  return {
    concept,
    topic,
    cognitiveLoad,
    explanation: `The question asked: "${question}". The correct answer is "${correctAnswer}". When reviewing ${concept}, note how intermediate layers propagate signals. Your choice "${userAnswer || 'previous answer'}" overlooked the underlying mathematical constraint that enforces stability and convergence.`,
    analogy,
    example: `When computing updates in ${topic}, maintaining proper scale ensures stable gradients and prevents numerical instability.`,
    keyPoint: `Key Takeaway: ${correctAnswer} ensures correct parameter optimization and reliable generalization.`,
    stepByStep: [
      `Step 1: Identify the underlying objective and constraints in ${concept}.`,
      `Step 2: Understand why "${correctAnswer}" satisfies the necessary convergence criteria.`,
      `Step 3: Connect this concept back to overall performance in ${topic}.`
    ],
    ragSourcesUsed: ragChunks.map(c => ({
      title: c.title,
      source: c.source,
      excerpt: c.content.slice(0, 150) + '...'
    })),
    generatedBy: 'Adaptive Engine (Deterministic Pedagogical Synthesizer)'
  };
}
