export const LESSON_TOPICS = [
  {
    id: 'backpropagation',
    title: 'Backpropagation & Gradient Flow',
    category: 'Deep Learning',
    difficulty: 'Intermediate',
    summary: 'The foundational algorithm for calculating the gradient of the loss function with respect to each weight in a neural network via the chain rule.',
    originalContent: {
      overview: 'Backpropagation is an abbreviation for "backward propagation of errors". It is an optimization method that computes the partial derivative of the scalar loss function with respect to all trainable parameters in a multi-layered artificial neural network.',
      mathematicalFormula: '∂L/∂w_ij = (∂L/∂y_k) * (∂y_k/∂z_j) * (∂z_j/∂w_ij)  [Chain Rule Expression]',
      technicalDetails: [
        'Forward Pass: Inputs are propagated layer by layer through linear projections (z = Wx + b) followed by non-linear activations a = f(z).',
        'Loss Evaluation: The objective loss L(y_hat, y) is calculated at the output layer against the target ground truth.',
        'Backward Pass: Error adjoints (deltas) are iteratively computed backwards using the chain rule from layer L down to layer 1.',
        'Parameter Update: Weights and biases are updated along the negative gradient direction: W := W - η * ∇_W(L).'
      ],
      standardExplanation: 'Backpropagation calculates the gradient of the loss function with respect to each weight by the chain rule, computing the gradient one layer at a time, iterating backward from the last layer to avoid redundant calculations of intermediate terms in the chain rule.'
    },
    quiz: [
      {
        id: 'bp-q1',
        topicId: 'backpropagation',
        question: 'Which mathematical principle forms the theoretical foundation of backpropagation in neural networks?',
        options: [
          'Bayes Theorem for conditional probability',
          'The Chain Rule of multivariable calculus',
          'Fourier Transform of activation functions',
          'Principal Component Analysis on loss surfaces'
        ],
        correctIndex: 1,
        explanation: 'Backpropagation repeatedly applies the Chain Rule of calculus to compute partial derivatives of the scalar loss with respect to each layer weight.',
        difficulty: 'EASY'
      },
      {
        id: 'bp-q2',
        topicId: 'backpropagation',
        question: 'What is the primary computational benefit of propagating error adjoints backward rather than forward?',
        options: [
          'It eliminates the need for non-linear activation functions',
          'It allows reusing intermediate derivative calculations without exponential redundancy',
          'It guarantees convergence to a global minimum on non-convex surfaces',
          'It replaces matrix multiplication with scalar addition'
        ],
        correctIndex: 1,
        explanation: 'Reverse-mode automatic differentiation (backpropagation) shares intermediate scalar sub-derivatives, enabling linear time complexity O(weights) rather than exponential O(weights^2).',
        difficulty: 'MEDIUM'
      },
      {
        id: 'bp-q3',
        topicId: 'backpropagation',
        question: 'What occurs during the backward pass when the gradient vanishes through deep layers with sigmoid activations?',
        options: [
          'Weights in the earliest layers receive near-zero updates and stop learning',
          'The loss function value immediately overflows to infinity',
          'The learning rate automatically increases to compensate',
          'The network collapses into an untrained single linear model'
        ],
        correctIndex: 0,
        explanation: 'Sigmoid derivatives have a maximum value of 0.25; multiplying many numbers < 1 causes the gradient to decay exponentially toward zero near the early layers.',
        difficulty: 'HARD'
      }
    ]
  },
  {
    id: 'linear-regression',
    title: 'Linear Regression & Cost Functions',
    category: 'Supervised Learning',
    difficulty: 'Beginner',
    summary: 'Modeling the linear relationship between a dependent scalar variable and one or more explanatory variables using Ordinary Least Squares and Mean Squared Error.',
    originalContent: {
      overview: 'Linear regression finds the optimal hyper-plane parameters (weights W and bias b) that minimize the sum of squared differences between predicted values y_hat and actual observed values y.',
      mathematicalFormula: 'y_hat = w_1*x_1 + w_2*x_2 + ... + w_n*x_n + b  |  J(w, b) = (1/2m) * Σ(y_hat^(i) - y^(i))^2',
      technicalDetails: [
        'Hypothesis Function: Linear transformation mapping input features vector x ∈ R^n to continuous prediction output y_hat ∈ R.',
        'Cost Function: Mean Squared Error (MSE) measures the variance of residuals, ensuring a convex quadratic optimization surface.',
        'Analytic Solution: Normal Equation W = (X^T * X)^(-1) * X^T * Y computes exact global minimum directly when X^T * X is non-singular.',
        'Iterative Solution: Gradient Descent adjusts parameters iteratively when matrix inversion is computationally expensive.'
      ],
      standardExplanation: 'Linear regression models the relationship between independent variables and a continuous dependent variable by fitting a linear equation to observed data. The method of least squares minimizes the sum of squared vertical offsets from the data points to the regression line.'
    },
    quiz: [
      {
        id: 'lr-q1',
        topicId: 'linear-regression',
        question: 'Why is Mean Squared Error (MSE) preferred over Mean Absolute Error (MAE) as a cost function for standard linear regression?',
        options: [
          'MSE is strictly differentiable everywhere and forms a convex parabolic bowl',
          'MSE produces smaller numbers that prevent numeric overflow',
          'MSE ignores extreme outliers in the dataset',
          'MSE eliminates the need for a bias term'
        ],
        correctIndex: 0,
        explanation: 'MSE is smooth, continuously differentiable, and convex, meaning any local minimum is guaranteed to be the global minimum with straightforward analytical derivatives.',
        difficulty: 'EASY'
      },
      {
        id: 'lr-q2',
        topicId: 'linear-regression',
        question: 'If a feature x is scaled by a factor of 10 prior to training, how does its optimal linear regression weight w change?',
        options: [
          'The weight scales up by a factor of 10',
          'The weight scales down by a factor of 1/10 to maintain the same product w*x',
          'The weight remains completely unaffected',
          'The bias term b becomes zero'
        ],
        correctIndex: 1,
        explanation: 'To maintain identical predictions y_hat = w_new * (10*x), the parameter must rescale to w_new = w_old / 10.',
        difficulty: 'MEDIUM'
      }
    ]
  },
  {
    id: 'logistic-regression',
    title: 'Logistic Regression & Classification',
    category: 'Supervised Learning',
    difficulty: 'Beginner',
    summary: 'Extending linear models to binary classification by squashing continuous linear logits through the logistic sigmoid function into bounded probability outputs.',
    originalContent: {
      overview: 'Logistic regression predicts the probability P(Y=1|X) of a categorical binary outcome. It maps unconstrained real-valued logits z = W^T * X + b to the [0, 1] interval via the Sigmoid/Logistic activation σ(z).',
      mathematicalFormula: 'σ(z) = 1 / (1 + e^(-z))  |  Loss(y, y_hat) = - [y*log(y_hat) + (1 - y)*log(1 - y_hat)]',
      technicalDetails: [
        'Sigmoid Function: Monotonically increasing S-curve with derivative σ\'(z) = σ(z)(1 - σ(z)).',
        'Decision Boundary: Standard threshold at P ≥ 0.5 corresponds to linear hyperplane z = W^T * X + b = 0.',
        'Binary Cross-Entropy Loss (Log Loss): Derived from maximum likelihood estimation under Bernoulli distribution.',
        'Convex Optimization: Negative log-likelihood is convex with respect to weights, ensuring reliable gradient convergence.'
      ],
      standardExplanation: 'Logistic regression applies a sigmoid activation function to a linear combination of input features to predict the probability of a binary event occurring, trained using Binary Cross-Entropy Loss.'
    },
    quiz: [
      {
        id: 'logr-q1',
        topicId: 'logistic-regression',
        question: 'What is the output range of the standard logistic sigmoid function σ(z)?',
        options: [
          '[-1, 1]',
          '[0, 1]',
          '[0, ∞)',
          '(-∞, ∞)'
        ],
        correctIndex: 1,
        explanation: 'The logistic function σ(z) = 1 / (1 + e^(-z)) maps any real input to the open interval (0, 1), representing valid probability values.',
        difficulty: 'EASY'
      },
      {
        id: 'logr-q2',
        topicId: 'logistic-regression',
        question: 'Why do we use Binary Cross-Entropy (Log Loss) instead of Mean Squared Error (MSE) for Logistic Regression?',
        options: [
          'MSE with a sigmoid activation results in a non-convex loss surface with many poor local minima',
          'Cross-entropy can only be computed with matrix multiplication',
          'MSE cannot accept decimal values between 0 and 1',
          'Cross-entropy eliminates the need for computing derivatives'
        ],
        correctIndex: 0,
        explanation: 'Using MSE with the non-linear sigmoid results in a bumpy non-convex loss function with plateaus where gradients vanish; Log Loss restores convexity.',
        difficulty: 'MEDIUM'
      }
    ]
  },
  {
    id: 'neural-networks',
    title: 'Neural Networks & Deep Architectures',
    category: 'Deep Learning',
    difficulty: 'Intermediate',
    summary: 'Hierarchical representation learning with multi-layer perceptrons, non-linear activation functions, universal approximation theorems, and dense feedforward mechanics.',
    originalContent: {
      overview: 'Artificial Neural Networks are interconnected layers of artificial neurons inspired by biological networks. By stacking multiple linear projections interleaved with non-linear activation functions, neural networks can approximate arbitrary complex continuous functions.',
      mathematicalFormula: 'a^(l) = f(W^(l) * a^(l-1) + b^(l))  |  ReLU(z) = max(0, z)',
      technicalDetails: [
        'Neuron Model: Computes linear dot product of input vectors with weight parameters, adds bias, and passes result through activation f(z).',
        'Universal Approximation Theorem: A feedforward network with a single hidden layer and non-linear activation can approximate any continuous function on compact subsets of R^n.',
        'Activation Functions: Non-linearities (ReLU, LeakyReLU, GeLU, Sigmoid, Tanh) allow networks to learn non-linear decision boundaries.',
        'Depth vs Width: Deep narrow architectures typically require exponentially fewer parameters than shallow wide architectures for equivalent hierarchical feature representations.'
      ],
      standardExplanation: 'Neural networks are composed of layers of nodes. Each node performs a weighted sum of inputs and applies an activation function. Stacking layers creates deep representations capable of learning complex non-linear patterns.'
    },
    quiz: [
      {
        id: 'nn-q1',
        topicId: 'neural-networks',
        question: 'What would happen if all activation functions in a 100-layer neural network were purely linear f(z) = z?',
        options: [
          'The network would learn 100 times faster than with non-linear activations',
          'The entire deep network collapses mathematically into an equivalent single-layer linear model',
          'The loss function would become non-convex',
          'The weights would immediately diverge to infinity'
        ],
        correctIndex: 1,
        explanation: 'The composition of consecutive linear transformations is itself just a single linear transformation (W2 * W1 * x = W_combined * x). Non-linear activations are essential for expressive capacity.',
        difficulty: 'EASY'
      }
    ]
  },
  {
    id: 'gradient-descent',
    title: 'Gradient Descent & Modern Optimizers',
    category: 'Optimization',
    difficulty: 'Intermediate',
    summary: 'First-order iterative optimization algorithms for finding the local minimum of a differentiable function, from Stochastic Gradient Descent (SGD) to Adam.',
    originalContent: {
      overview: 'Gradient Descent iteratively shifts parameter values in the direction of steepest descent, defined by the negative gradient of the loss function with respect to parameters: θ := θ - α * ∇J(θ).',
      mathematicalFormula: 'θ_(t+1) = θ_t - α * (m_t / (sqrt(v_t) + ε))  [Adaptive Moment Estimation / Adam]',
      technicalDetails: [
        'Batch Gradient Descent: Calculates exact gradients using entire training dataset per step (stable but computationally slow for large datasets).',
        'Stochastic Gradient Descent (SGD): Updates parameters per individual training sample (noisy gradient trajectory helps escape shallow local minima).',
        'Mini-Batch Gradient Descent: Compromise utilizing vectorization over batches of size B (typically 32-512) for hardware efficiency.',
        'Momentum & Adam: Exponentially decaying moving averages of gradients (1st moment m_t) and squared gradients (2nd moment v_t) with bias correction.'
      ],
      standardExplanation: 'Gradient descent is an optimization algorithm used to minimize the cost function by iteratively moving in the direction of steepest descent. Variants include Batch GD, SGD, Mini-batch GD, and adaptive learning rate optimizers such as RMSProp and Adam.'
    },
    quiz: [
      {
        id: 'gd-q1',
        topicId: 'gradient-descent',
        question: 'What happens if the learning rate α in gradient descent is configured to be too large?',
        options: [
          'Training converges in fewer than 3 steps',
          'The parameter updates overshoot the minimum and the cost function may diverge to infinity',
          'The gradients vanish and parameters freeze',
          'The optimizer converts into Stochastic Gradient Descent'
        ],
        correctIndex: 1,
        explanation: 'Excessive learning rates take oversized steps across loss valleys, repeatedly overshooting the bottom and causing the loss to oscillate and diverge.',
        difficulty: 'EASY'
      }
    ]
  },
  {
    id: 'overfitting',
    title: 'Overfitting, Bias-Variance & Regularization',
    category: 'Machine Learning Theory',
    difficulty: 'Intermediate',
    summary: 'Understanding generalization error, high variance vs high bias, and mitigation techniques including L1 Lasso, L2 Ridge, Dropout, and Early Stopping.',
    originalContent: {
      overview: 'Overfitting occurs when a machine learning model learns the training data and noise too closely, failing to generalize to unseen testing data. It manifests as low training error but high test/validation error.',
      mathematicalFormula: 'Total Error = Bias^2 + Variance + Irreducible Noise  |  Loss_regularized = Loss_data + λ*||W||_2^2',
      technicalDetails: [
        'Bias: Error introduced by approximating a real-world complex problem with an overly simplistic model (underfitting).',
        'Variance: Sensitivity to fluctuations in the training dataset; model fits noise rather than true underlying distribution (overfitting).',
        'L2 Regularization (Ridge / Weight Decay): Penalizes the sum of squared weight magnitudes, shrinking parameters toward zero.',
        'L1 Regularization (Lasso): Penalizes the absolute sum of weights, driving non-essential feature weights to exact zero for sparse selection.',
        'Dropout: Randomly deactivates a fraction p of neurons during each training step, preventing co-adaptation of features.'
      ],
      standardExplanation: 'Overfitting represents high variance where a model memorizes random noise in training samples. Regularization techniques such as L1/L2 penalties, cross-validation, dropout, and early stopping constrain model capacity to ensure generalization.'
    },
    quiz: [
      {
        id: 'of-q1',
        topicId: 'overfitting',
        question: 'Which regularization technique induces true sparsity by driving unimportant weight coefficients to exactly zero?',
        options: [
          'L2 Ridge Regularization (Squared Norm)',
          'L1 Lasso Regularization (Absolute Norm)',
          'Batch Normalization',
          'Linear Learning Rate Warmup'
        ],
        correctIndex: 1,
        explanation: 'Due to the geometric diamond shape of L1 norm contours, level curves of the objective function intersect corners on axes, causing parameters to equal exactly zero.',
        difficulty: 'MEDIUM'
      }
    ]
  },
  {
    id: 'classification-metrics',
    title: 'Classification Metrics & Evaluation',
    category: 'Evaluation',
    difficulty: 'Beginner',
    summary: 'Evaluating classifier performance beyond simple accuracy using Confusion Matrices, Precision, Recall, F1-Score, Specificity, and ROC-AUC curves.',
    originalContent: {
      overview: 'Accuracy can be dangerously misleading on imbalanced datasets. Comprehensive model evaluation requires decoupling type I errors (false positives) and type II errors (false negatives) using precision, recall, and harmonic F1 measures.',
      mathematicalFormula: 'Precision = TP / (TP + FP)  |  Recall = TP / (TP + FN)  |  F1 = 2 * (Precision * Recall) / (Precision + Recall)',
      technicalDetails: [
        'True Positive (TP) & True Negative (TN): Correctly classified positive and negative instances.',
        'False Positive (FP - Type I): Predicted positive when ground truth is negative (false alarm).',
        'False Negative (FN - Type II): Predicted negative when ground truth is positive (missed detection).',
        'ROC Curve & AUC: Plots True Positive Rate vs False Positive Rate across varying probability decision thresholds from 0 to 1.'
      ],
      standardExplanation: 'Classification metrics measure model predictions against true labels. Precision measures accuracy among positive predictions, recall measures completeness among actual positive instances, and the F1-score balances both via their harmonic mean.'
    },
    quiz: [
      {
        id: 'cm-q1',
        topicId: 'classification-metrics',
        question: 'In a medical diagnostic classifier detecting a rare disease, which metric is most critical to minimize missed sick patients (False Negatives)?',
        options: [
          'Precision',
          'Recall (Sensitivity)',
          'Specificity',
          'Overall raw Accuracy'
        ],
        correctIndex: 1,
        explanation: 'Recall = TP / (TP + FN). Maximizing recall ensures that very few actual positive disease cases are missed as False Negatives.',
        difficulty: 'EASY'
      }
    ]
  },
  {
    id: 'machine-learning',
    title: 'Machine Learning Paradigms & Foundations',
    category: 'Fundamentals',
    difficulty: 'Beginner',
    summary: 'High-level taxonomy of artificial intelligence, supervised learning, unsupervised clustering, reinforcement learning, feature engineering, and the ML lifecycle.',
    originalContent: {
      overview: 'Machine learning is the branch of computer science where algorithms improve their performance on a specific task through empirical experience and statistical pattern extraction, without being explicitly programmed with rule-based heuristics.',
      mathematicalFormula: 'Experience (E) + Task (T) + Performance Measure (P) → Optimization Problem',
      technicalDetails: [
        'Supervised Learning: Training with explicit ground-truth input-output pairs (X, Y) for regression and classification.',
        'Unsupervised Learning: Discovering latent structural patterns, clusters, or dimensionality reductions in unlabeled data (X).',
        'Reinforcement Learning: Agent interacting with an environment through actions, receiving scalar rewards or penalties to learn an optimal policy.',
        'Generalization: The ultimate measure of an ML system is performance on unseen test data from the same data-generating distribution.'
      ],
      standardExplanation: 'Machine learning enables computational systems to discover underlying mathematical patterns in data to make predictions or decisions on novel observations.'
    },
    quiz: [
      {
        id: 'ml-q1',
        topicId: 'machine-learning',
        question: 'Which of the following is an example of an unsupervised learning task?',
        options: [
          'Predicting tomorrow stock price given past price logs',
          'Clustering customer shopping habits without pre-existing group labels',
          'Classifying emails into Spam or Ham from labeled examples',
          'Training a game bot using win/loss rewards'
        ],
        correctIndex: 1,
        explanation: 'Clustering unlabelled data points into natural grouping patterns is a canonical unsupervised learning problem.',
        difficulty: 'EASY'
      }
    ]
  }
];

export const EDUCATIONAL_RAG_CORPUS = [
  {
    id: 'rag-bp-1',
    source: 'OpenStax Deep Learning Textbook (Ch. 6.5)',
    sourceType: 'OpenStax',
    topicId: 'backpropagation',
    title: 'Reverse-Mode Automatic Differentiation & The Chain Rule',
    content: 'Backpropagation is an application of reverse-mode automatic differentiation. In a computational graph, forward evaluation computes intermediate node outputs. The backward pass propagates partial derivatives from the scalar loss backward through each node using the multivariate chain rule. By storing intermediate activations computed during the forward pass, backpropagation avoids exponential repeated sub-tree evaluations.',
    tags: ['backpropagation', 'chain rule', 'computational graph', 'gradients']
  },
  {
    id: 'rag-bp-2',
    source: 'Stanford CS229 / Goodfellow Deep Learning',
    sourceType: 'Textbook',
    topicId: 'backpropagation',
    title: 'Intuition: The Blame Assignment Analogy',
    content: 'An intuitive analogy for backpropagation is the "Blame Assignment / Feedback in an Assembly Line". Imagine a team building a toy car that arrives with a defect. Rather than blaming the entire factory randomly, you inspect the final assembly stage, see which technician tightened the last bolt incorrectly, then walk backward to the preceding parts supplier, and adjust everyone proportional to their exact contribution to the defect.',
    tags: ['backpropagation', 'analogy', 'intuition', 'scaffolding']
  },
  {
    id: 'rag-bp-3',
    source: 'arXiv:1806.01234 - Neural Network Foundations',
    sourceType: 'arXiv',
    topicId: 'backpropagation',
    title: 'Step-by-Step Gradient Flow Walkthrough',
    content: 'Step 1: Compute output error delta = (y_pred - y_true). Step 2: Multiply delta by derivative of output activation function. Step 3: Compute weight gradient dW = delta * input_features^T. Step 4: Propagate delta backward to preceding layer: delta_prev = (W^T * delta) * activation_derivative(z_prev). Step 5: Update weights using learning rate: W = W - alpha * dW.',
    tags: ['backpropagation', 'step-by-step', 'algorithm', 'formula']
  },
  {
    id: 'rag-lr-1',
    source: 'OpenStax College Statistics & Machine Learning',
    sourceType: 'OpenStax',
    topicId: 'linear-regression',
    title: 'Ordinary Least Squares & The Best Fit Line',
    content: 'Linear regression models a direct proportional relationship between variables. Ordinary Least Squares (OLS) calculates the best-fitting straight line through scatter data points by minimizing the sum of the squared vertical distances (residuals) from each individual data point to the candidate regression line.',
    tags: ['linear regression', 'least squares', 'residuals', 'best fit']
  },
  {
    id: 'rag-lr-2',
    source: 'Introductory Machine Learning Essentials',
    sourceType: 'Textbook',
    topicId: 'linear-regression',
    title: 'Analogy: The Rubber Band Ruler Fit',
    content: 'Imagine attaching small rubber bands from every single point on a graph paper to a rigid wooden ruler. If you release the ruler, the tension in all the stretched rubber bands will naturally pull and settle the ruler into the exact orientation that minimizes the total elastic strain energy. That physical resting position is precisely the Ordinary Least Squares linear regression line!',
    tags: ['linear regression', 'analogy', 'intuition']
  },
  {
    id: 'rag-logr-1',
    source: 'OpenStax AI Fundamentals',
    sourceType: 'OpenStax',
    topicId: 'logistic-regression',
    title: 'The Sigmoid Gatekeeper & Log-Odds Transformation',
    content: 'Logistic regression translates unbounded linear values (-infinity to +infinity) into a bounded probability score strictly between 0% and 100% (0.0 to 1.0) using the Sigmoid S-curve function. If the linear combination produces a high positive score, the sigmoid approaches 1.0; if large negative, it approaches 0.0.',
    tags: ['logistic regression', 'sigmoid', 'probability', 'classification']
  },
  {
    id: 'rag-nn-1',
    source: 'Deep Learning with Python & PyTorch Notes',
    sourceType: 'Textbook',
    topicId: 'neural-networks',
    title: 'Neurons as Feature Combiners',
    content: 'Each artificial neuron acts like a tiny decision maker. It multiplies each input by an importance weight, sums them up with a baseline threshold (bias), and checks if the signal is strong enough to pass through an activation gate (such as ReLU). When thousands of these simple units connect together in layers, they can recognize complex images, text, and speech.',
    tags: ['neural networks', 'neurons', 'layers', 'deep learning']
  },
  {
    id: 'rag-nn-2',
    source: 'arXiv:1904.08901 - Architectural Insights',
    sourceType: 'arXiv',
    topicId: 'neural-networks',
    title: 'Analogy: The Detective Committee',
    content: 'Think of a deep neural network as a multi-tier committee of detectives investigating a mystery. Layer 1 detectives look only for basic clues (lines, edges, colors). Layer 2 detectives combine those basic clues to spot larger parts (noses, wheels, words). Layer 3 detectives look at those parts to make the final diagnosis (is this a cat or a car?).',
    tags: ['neural networks', 'analogy', 'intuition', 'hierarchy']
  },
  {
    id: 'rag-gd-1',
    source: 'Optimization Algorithms for Machine Learning',
    sourceType: 'Textbook',
    topicId: 'gradient-descent',
    title: 'Analogy: The Foggy Mountain Descent',
    content: 'Imagine you are stranded in dense fog at the top of a hilly mountain range and need to reach the valley below. You cannot see the landscape ahead. To descend safely, you feel the slope of the ground right beneath your boots and take a small step downward in the steepest descending direction. Repeating this step after step is Gradient Descent.',
    tags: ['gradient descent', 'analogy', 'optimization', 'intuition']
  },
  {
    id: 'rag-of-1',
    source: 'OpenStax Statistics & Data Science',
    sourceType: 'OpenStax',
    topicId: 'overfitting',
    title: 'Analogy: Memorizing Exam Questions vs Learning Concepts',
    content: 'Overfitting is like a student who memorizes the exact punctuation and numbers of past exam practice problems word-for-word instead of learning the underlying concepts. On the practice test, the student scores 100% (low training error). But when given the real final exam with slightly modified numbers, the student fails (high test error).',
    tags: ['overfitting', 'generalization', 'analogy', 'bias-variance']
  },
  {
    id: 'rag-cm-1',
    source: 'Evaluation Metrics in Healthcare & AI',
    sourceType: 'OpenStax',
    topicId: 'classification-metrics',
    title: 'Precision vs Recall: The Fire Alarm vs Security Guard',
    content: 'Precision is like a high-accuracy security guard: when the alarm rings, you want to be certain there really is an intruder (few false alarms). Recall is like a sensitive smoke detector in a baby room: you want it to trigger for every single wisp of smoke, even if cooking toast occasionally creates a false alarm, because missing a real fire is unacceptable.',
    tags: ['classification metrics', 'precision', 'recall', 'analogy']
  }
];
