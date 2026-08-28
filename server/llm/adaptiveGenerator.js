import { GoogleGenAI } from '@google/genai';
import { LESSON_TOPICS } from '../rag/knowledgeBase.js';
import { vectorStore } from '../rag/vectorStore.js';

let genAIClient = null;
let lastQuotaExhaustedTimestamp = 0;
const QUOTA_COOLDOWN_MS = 5 * 60 * 1000; // 5m cooldown if API key hits 429 quota or 503

// In-memory cache for adapted content to eliminate duplicate API requests and prevent quota burn
const adaptationCache = new Map();

function getGenAI() {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAIClient;
}

export async function generateAdaptiveContent(
  topicId,
  cognitiveLoad,
  confidence = 0.85,
  consecutiveHighLoadCount = 0,
  features,
  customQuery
) {
  const lesson = LESSON_TOPICS.find(l => l.id === topicId) || LESSON_TOPICS[0];

  // 1. Retrieve RAG grounding chunks based on topic and learner query
  const ragQuery = customQuery || `${lesson.title} ${cognitiveLoad === 'HIGH' ? 'analogy intuition simplified explanation step by step' : 'mathematical technical details'}`;
  const retrievedChunks = vectorStore.search(ragQuery, topicId, 3);
  const ragContext = retrievedChunks.map(c => `[Source: ${c.source} | Title: ${c.title}]\n${c.content}`).join('\n\n');

  // Determine adaptation level (1 = Standard, 2 = Simplified, 3 = Maximum Scaffolding)
  let adaptationLevel = 1;
  if (cognitiveLoad === 'HIGH' || consecutiveHighLoadCount >= 2) {
    adaptationLevel = 3;
  } else if (cognitiveLoad === 'MEDIUM' || consecutiveHighLoadCount === 1) {
    adaptationLevel = 2;
  }

  const cacheKey = `${topicId}_${cognitiveLoad}_${adaptationLevel}_${(customQuery || '').slice(0, 30)}`;

  if (adaptationCache.has(cacheKey)) {
    const cached = adaptationCache.get(cacheKey);
    return {
      ...cached,
      ragSourcesUsed: retrievedChunks.map(c => ({
        title: c.title,
        source: c.source,
        excerpt: c.content.slice(0, 160) + '...'
      }))
    };
  }

  const ai = getGenAI();
  const isCooldownActive = Date.now() - lastQuotaExhaustedTimestamp < QUOTA_COOLDOWN_MS;

  if (ai && !isCooldownActive) {
    const candidateModels = ['gemini-2.5-flash', 'gemini-3.7-flash', 'gemini-3.1-flash-lite'];

    for (const modelName of candidateModels) {
      if (Date.now() - lastQuotaExhaustedTimestamp < QUOTA_COOLDOWN_MS) {
        break;
      }

      try {
        const prompt = `You are an expert cognitive load-aware adaptive educational AI tutor.
Your goal is to dynamically adapt an educational lesson for a student in real-time based on their predicted Cognitive Load State.

Learner Telemetry Profile:
- Target Topic: ${lesson.title} (${lesson.category})
- Predicted Cognitive Load: ${cognitiveLoad} (Confidence: ${Math.round(confidence * 100)}%)
- Adaptation Scaffolding Level: Level ${adaptationLevel}/3
${features ? `- Observed Signals: Dwell time: ${features.time_per_page}s, Scroll speed: ${features.scroll_speed}px/s, Re-reads: ${features.number_of_re_reads}, Backtracks: ${features.backtracking_count}, Quiz Accuracy: ${features.quiz_accuracy}%` : ''}

Original Lesson Technical Overview:
${lesson.originalContent.overview}
Standard Explanation:
${lesson.originalContent.standardExplanation}
Technical Details:
${lesson.originalContent.technicalDetails.join('\n')}
Formula: ${lesson.originalContent.mathematicalFormula || 'None'}

Retrieved Verified Textbook Context (RAG Knowledge):
${ragContext}

Adaptation Rules based on Cognitive Load:
- If HIGH Cognitive Load (Level 3 Scaffolding): The student is experiencing heavy mental fatigue or struggling with abstract concepts. 
  1. Translate complex mathematical formulas into intuitive plain-English physical metaphors or daily-life analogies.
  2. Break multi-step logic into 3-4 bite-sized numbered steps.
  3. Include a very concrete, easy-to-visualize example.
  4. Write short, punchy paragraphs with high readability.
  
- If MEDIUM Cognitive Load (Level 2 Scaffolding): The student is keeping up but needs conceptual reinforcement. 
  1. Blend the formal definition with practical intuition.
  2. Highlight the "Why this matters" practical takeaway.
  3. Provide a clear step-by-step walkthrough.

- If LOW Cognitive Load (Level 1 Standard): The learner is comfortable, fast, and needs depth. 
  1. Provide formal mathematical formulations, algorithmic trade-offs, and computational complexity details.
  2. Include optimization nuances and edge cases.

OUTPUT MUST BE VALID JSON ONLY matching this exact JSON schema:
{
  "title": "${lesson.title}",
  "summary": "1-2 sentence high-level summary adapted for ${cognitiveLoad} cognitive load",
  "coreExplanation": "The main lesson text thoroughly explained with the appropriate degree of scaffolding and clarity",
  "analogy": "An intuitive, creative real-world analogy (required if load is HIGH/MEDIUM, optional for LOW)",
  "concreteExample": "A practical concrete example demonstrating the concept in action",
  "stepByStep": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "keyTakeaways": [
    "Key Point 1",
    "Key Point 2",
    "Key Point 3"
  ],
  "scaffoldingNotes": "Brief explanation of how this content was tailored to the learner's ${cognitiveLoad} load"
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
          const adaptedContent = {
            topicId,
            cognitiveLoad,
            adaptationLevel,
            title: parsed.title || lesson.title,
            summary: parsed.summary || lesson.summary,
            coreExplanation: parsed.coreExplanation || lesson.originalContent.overview,
            analogy: parsed.analogy || undefined,
            concreteExample: parsed.concreteExample || undefined,
            stepByStep: parsed.stepByStep || undefined,
            keyTakeaways: parsed.keyTakeaways || [
              'Understand the fundamental mechanics of ' + lesson.title,
              'Connect theory to practical implementations',
              'Monitor computational stability and convergence'
            ],
            ragSourcesUsed: retrievedChunks.map(c => ({
              title: c.title,
              source: c.source,
              excerpt: c.content.slice(0, 160) + '...'
            })),
            scaffoldingNotes: parsed.scaffoldingNotes || `Scaffolded for ${cognitiveLoad} cognitive load.`,
            generatedBy: modelName
          };

          adaptationCache.set(cacheKey, adaptedContent);
          return adaptedContent;
        }
      } catch (err) {
        const errorMsg = String(err?.message || err);
        if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
          lastQuotaExhaustedTimestamp = Date.now();
          console.info(`[AdaptiveGenerator] Gemini free-tier quota reached. Activating cognitive rule-based pedagogical synthesizer fallback.`);
          break;
        } else {
          console.info(`[AdaptiveGenerator] Note on model ${modelName}: Using resilient adaptive synthesis.`);
        }
      }
    }
  }

  const fallback = generateRuleBasedAdaptedContent(lesson, cognitiveLoad, adaptationLevel, retrievedChunks);
  adaptationCache.set(cacheKey, fallback);
  return fallback;
}

function generateRuleBasedAdaptedContent(
  lesson,
  cognitiveLoad,
  adaptationLevel,
  retrievedChunks
) {
  if (cognitiveLoad === 'HIGH') {
    return {
      topicId: lesson.id,
      cognitiveLoad: 'HIGH',
      adaptationLevel: 3,
      title: `${lesson.title} (Simplified & Scaffolded)`,
      summary: `A simplified conceptual guide to ${lesson.title}, broken down with everyday analogies to reduce cognitive friction.`,
      coreExplanation: `When learning ${lesson.title}, it helps to step back from pure mathematics and look at what the system is actually trying to accomplish.\n\nAt its core: ${lesson.originalContent.overview}\n\nInstead of memorizing symbols, think about how information moves forward to make a guess, and how feedback flows backward to correct mistakes. Each part of the network only needs to worry about its own small adjustment.`,
      analogy: getTopicAnalogy(lesson.id),
      concreteExample: `Imagine you are adjusting the temperature in a shower with slightly delayed water flow: if it's too cold, you turn the knob slightly hotter, wait a second to feel the outcome, and refine. That incremental calibration is how ${lesson.title} optimizes parameters.`,
      stepByStep: [
        'Step 1: Input features enter the system and make an initial prediction (Forward Pass).',
        'Step 2: The system measures the gap between its prediction and the true answer (Loss Calculation).',
        'Step 3: The system traces backwards through each layer to assign blame for the error (Gradient Calculation).',
        'Step 4: Parameters take a small step in the direction that decreases the error (Parameter Update).'
      ],
      keyTakeaways: [
        'Complex formulas represent simple feedback loops that iteratively correct errors.',
        'Taking measured, moderate update steps ensures stability and prevents erratic divergence.',
        'Breaking deep hierarchies into individual modular layers makes training mathematically feasible.'
      ],
      ragSourcesUsed: retrievedChunks.map(c => ({
        title: c.title,
        source: c.source,
        excerpt: c.content.slice(0, 160) + '...'
      })),
      scaffoldingNotes: 'Applied Level 3 maximum pedagogical scaffolding: replaced dense calculus with visual analogies, simplified vocabulary, and structured modular steps.',
      generatedBy: 'Adaptive Engine'
    };
  }

  if (cognitiveLoad === 'MEDIUM') {
    return {
      topicId: lesson.id,
      cognitiveLoad: 'MEDIUM',
      adaptationLevel: 2,
      title: `${lesson.title} (Guided Conceptual Walkthrough)`,
      summary: `A balanced overview connecting foundational principles with mathematical implementations for ${lesson.title}.`,
      coreExplanation: `${lesson.originalContent.overview}\n\n${lesson.originalContent.standardExplanation}\n\nKey Formula: ${lesson.originalContent.mathematicalFormula || 'N/A'}`,
      analogy: getTopicAnalogy(lesson.id),
      concreteExample: `Consider a dataset with training samples. The objective function calculates continuous loss variance, and the optimizer calculates partial derivatives to navigate the multidimensional loss terrain toward the minimum.`,
      stepByStep: lesson.originalContent.technicalDetails,
      keyTakeaways: [
        'Combines analytical mathematical formulations with practical optimization routines.',
        'Continuous differentiability ensures smooth gradient propagation across layer boundaries.',
        'Balancing model complexity against generalization prevents underfitting and overfitting.'
      ],
      ragSourcesUsed: retrievedChunks.map(c => ({
        title: c.title,
        source: c.source,
        excerpt: c.content.slice(0, 160) + '...'
      })),
      scaffoldingNotes: 'Applied Level 2 intermediate scaffolding: balanced technical formulations with conceptual grounding.',
      generatedBy: 'Adaptive Engine'
    };
  }

  return {
    topicId: lesson.id,
    cognitiveLoad: 'LOW',
    adaptationLevel: 1,
    title: `${lesson.title} (Advanced Technical Formulation)`,
    summary: `Comprehensive mathematical, architectural, and algorithmic analysis of ${lesson.title}.`,
    coreExplanation: `${lesson.originalContent.overview}\n\n${lesson.originalContent.standardExplanation}\n\nFormal Definition:\n${lesson.originalContent.mathematicalFormula || 'Standard analytical formulation.'}`,
    concreteExample: `In a production computational graph, reverse-mode automatic differentiation executes in O(W) time complexity relative to the parameter space W, enabling massive parallel acceleration on vectorized accelerator tensor cores.`,
    stepByStep: lesson.originalContent.technicalDetails,
    keyTakeaways: [
      'Reverse-mode automatic differentiation achieves linear time efficiency over parameter dimension.',
      'Convexity constraints dictate whether first-order gradient methods guarantee global optimality.',
      'Eigenvalue spectrum of the Hessian matrix governs conditioning and maximum stable learning rate.'
    ],
    ragSourcesUsed: retrievedChunks.map(c => ({
      title: c.title,
      source: c.source,
      excerpt: c.content.slice(0, 160) + '...'
    })),
    scaffoldingNotes: 'Applied Level 1 deep academic formulation: high technical density, mathematical precision, and asymptotic complexity analysis.',
    generatedBy: 'Adaptive Engine'
  };
}

function getTopicAnalogy(topicId) {
  switch (topicId) {
    case 'backpropagation':
      return 'The Assembly Line Blame Assignment: When a car arrives at the end of a factory line with a loose wheel, supervisors walk backwards along the assembly stations to adjust the exact wrench torque at each preceding station proportionally.';
    case 'linear-regression':
      return 'The Elastic Rubber Bands: Imagine attaching tiny rubber bands from every scatter plot point to a wooden ruler. The ruler naturally pivots and settles into the angle where total rubber band tension is minimized.';
    case 'logistic-regression':
      return 'The Soft Bouncer: Instead of a harsh yes/no cutoff, the sigmoid curve acts like a flexible filter that smoothly converts numbers into a percentage probability from 0% to 100%.';
    case 'neural-networks':
      return 'The Detective Committee: Junior detectives spot basic lines and edges; senior detectives assemble lines into faces; the chief inspector identifies the person.';
    case 'gradient-descent':
      return 'Descending in Heavy Fog: Walking down a foggy hill by feeling the slope directly under your feet and taking careful steps in the steepest downhill direction.';
    case 'overfitting':
      return 'Memorizing Practice Tests: A student who memorizes exact numbers on old practice exams will score 100% at home, but fails when test questions have different numbers.';
    case 'classification-metrics':
      return 'Fire Alarms vs Security Guards: Precision ensures you never falsely accuse someone, while Recall ensures you never miss a real emergency even if toast creates a false alarm.';
    default:
      return 'A multi-stage feedback control loop balancing accuracy against complexity.';
  }
}
