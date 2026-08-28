import { EDUCATIONAL_RAG_CORPUS } from './knowledgeBase.js';

export class VectorStore {
  constructor() {
    this.chunks = [];
    this.vocabulary = new Map();
    this.idf = new Map();
    this.docVectors = new Map();
    this.init();
  }

  init() {
    this.chunks = [...EDUCATIONAL_RAG_CORPUS];
    this.rebuildIndex();
  }

  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s_-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1 && !this.isStopword(w));
  }

  isStopword(word) {
    const stopwords = new Set([
      'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'with', 'to',
      'for', 'of', 'as', 'by', 'that', 'this', 'it', 'from', 'be', 'are', 'was',
      'were', 'will', 'can', 'has', 'have', 'had', 'its', 'into', 'than', 'then'
    ]);
    return stopwords.has(word);
  }

  rebuildIndex() {
    this.vocabulary.clear();
    this.idf.clear();
    this.docVectors.clear();

    let vocabIndex = 0;
    const docTokensList = [];
    const docFrequency = new Map();

    for (const chunk of this.chunks) {
      const fullText = `${chunk.title} ${chunk.content} ${(chunk.tags || []).join(' ')} ${chunk.topicId}`;
      const tokens = this.tokenize(fullText);
      docTokensList.push({ id: chunk.id, tokens });

      const uniqueTokensInDoc = new Set(tokens);
      for (const token of uniqueTokensInDoc) {
        if (!this.vocabulary.has(token)) {
          this.vocabulary.set(token, vocabIndex++);
        }
        docFrequency.set(token, (docFrequency.get(token) || 0) + 1);
      }
    }

    const N = this.chunks.length || 1;
    for (const [term, df] of docFrequency.entries()) {
      // Smoothed IDF
      this.idf.set(term, Math.log((N + 1) / (df + 1)) + 1);
    }

    // Build TF-IDF vectors
    for (const doc of docTokensList) {
      const tf = new Map();
      for (const token of doc.tokens) {
        tf.set(token, (tf.get(token) || 0) + 1);
      }

      const vector = new Map();
      let normSq = 0;

      for (const [token, count] of tf.entries()) {
        const termIdx = this.vocabulary.get(token);
        const termIdf = this.idf.get(token) || 1;
        if (termIdx !== undefined) {
          const tfidf = (count / doc.tokens.length) * termIdf;
          vector.set(termIdx, tfidf);
          normSq += tfidf * tfidf;
        }
      }

      // Normalize vector
      const norm = Math.sqrt(normSq) || 1;
      for (const [idx, val] of vector.entries()) {
        vector.set(idx, val / norm);
      }

      this.docVectors.set(doc.id, vector);
    }
  }

  search(query, topicId, topK = 3) {
    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) {
      if (topicId) {
        return this.chunks.filter(c => c.topicId === topicId).slice(0, topK);
      }
      return this.chunks.slice(0, topK);
    }

    const queryTf = new Map();
    for (const t of queryTokens) {
      queryTf.set(t, (queryTf.get(t) || 0) + 1);
    }

    const queryVector = new Map();
    let queryNormSq = 0;

    for (const [token, count] of queryTf.entries()) {
      const termIdx = this.vocabulary.get(token);
      const termIdf = this.idf.get(token) || 1;
      if (termIdx !== undefined) {
        const tfidf = (count / queryTokens.length) * termIdf;
        queryVector.set(termIdx, tfidf);
        queryNormSq += tfidf * tfidf;
      }
    }

    const queryNorm = Math.sqrt(queryNormSq) || 1;
    for (const [idx, val] of queryVector.entries()) {
      queryVector.set(idx, val / queryNorm);
    }

    // Compute Cosine similarity with candidate chunks
    const scoredChunks = [];

    for (const chunk of this.chunks) {
      let topicBonus = 0;
      if (topicId && chunk.topicId === topicId) {
        topicBonus = 0.25;
      }

      const docVec = this.docVectors.get(chunk.id);
      let dotProduct = 0;

      if (docVec) {
        for (const [termIdx, qVal] of queryVector.entries()) {
          const dVal = docVec.get(termIdx);
          if (dVal !== undefined) {
            dotProduct += qVal * dVal;
          }
        }
      }

      const queryStr = query.toLowerCase();
      for (const tag of chunk.tags || []) {
        if (queryStr.includes(tag.toLowerCase())) {
          topicBonus += 0.15;
        }
      }

      const finalScore = dotProduct + topicBonus;
      scoredChunks.push({
        chunk: { ...chunk, relevanceScore: Math.round(Math.min(0.99, finalScore + 0.15) * 100) / 100 },
        score: finalScore
      });
    }

    scoredChunks.sort((a, b) => b.score - a.score);
    return scoredChunks.slice(0, topK).map(s => s.chunk);
  }

  addDocument(doc) {
    const paragraphs = doc.content.split(/\n\s*\n/).filter(p => p.trim().length > 20);
    const newChunks = [];

    if (paragraphs.length <= 1) {
      const chunk = {
        id: `user-doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: doc.title,
        content: doc.content.trim(),
        source: doc.source || 'User Uploaded Document',
        sourceType: 'UserUpload',
        topicId: doc.topicId || 'general',
        tags: doc.tags || ['user-document', 'custom-knowledge']
      };
      this.chunks.push(chunk);
      newChunks.push(chunk);
    } else {
      paragraphs.forEach((p, idx) => {
        const chunk = {
          id: `user-doc-${Date.now()}-${idx}`,
          title: `${doc.title} (Part ${idx + 1})`,
          content: p.trim(),
          source: doc.source || 'User Uploaded Document',
          sourceType: 'UserUpload',
          topicId: doc.topicId || 'general',
          tags: doc.tags || ['user-document']
        };
        this.chunks.push(chunk);
        newChunks.push(chunk);
      });
    }

    this.rebuildIndex();
    return newChunks[0];
  }

  getAllChunks() {
    return this.chunks;
  }

  getStats() {
    return {
      totalChunks: this.chunks.length,
      vocabularySize: this.vocabulary.size,
      sourceTypes: {
        OpenStax: this.chunks.filter(c => c.sourceType === 'OpenStax').length,
        Textbook: this.chunks.filter(c => c.sourceType === 'Textbook').length,
        arXiv: this.chunks.filter(c => c.sourceType === 'arXiv').length,
        UserUpload: this.chunks.filter(c => c.sourceType === 'UserUpload').length,
      }
    };
  }
}

export const vectorStore = new VectorStore();
