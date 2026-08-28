import React, { useEffect, useState } from 'react';
import {
  Database,
  FileText,
  Filter,
  PlusCircle,
  RefreshCw,
  Search,
  Sparkles,
  UploadCloud
} from 'lucide-react';
import { fetchDocuments, searchRAG, uploadDocument } from '../services/api.js';

export const KnowledgeBasePage = () => {
  const [chunks, setChunks] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('all');

  // Ingestion form state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docSource, setDocSource] = useState('OpenStax Machine Learning / Custom');
  const [docTopicId, setDocTopicId] = useState('backpropagation');
  const [docTags, setDocTags] = useState('neural networks, optimization, gradient');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);

  const loadData = async () => {
    try {
      const data = await fetchDocuments();
      setChunks(data.chunks);
      setStats(data.stats);
    } catch (e) {
      console.error('Failed to load documents:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchRAG(searchQuery, selectedTopicFilter === 'all' ? undefined : selectedTopicFilter, 5);
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) return;

    setIsUploading(true);
    setUploadMessage(null);
    try {
      await uploadDocument({
        title: docTitle,
        content: docContent,
        source: docSource,
        topicId: docTopicId,
        tags: docTags.split(',').map(t => t.trim()).filter(Boolean)
      });
      setUploadMessage('Document successfully indexed into TF-IDF vector space!');
      setDocTitle('');
      setDocContent('');
      await loadData();
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadMessage(null);
      }, 1500);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredChunks = selectedTopicFilter === 'all'
    ? chunks
    : chunks.filter(c => c.topicId === selectedTopicFilter);

  return (
    <div className="space-y-8 pb-12" id="knowledge-base-container">
      {/* Top Banner & Stats */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              Academic Knowledge Base & Semantic Vector Corpus
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Vector Space
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Indexed educational sources: OpenStax textbooks, arXiv research publications, and pedagogical analogy repositories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            id="open-upload-doc-modal-btn"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Index New Document
          </button>
        </div>
      </div>

      {/* Vector Store Summary Badges */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
            <span className="text-slate-400 font-medium">Indexed Chunks</span>
            <p className="text-xl font-black text-slate-900">{stats.totalChunks}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
            <span className="text-slate-400 font-medium">Vocabulary Terms</span>
            <p className="text-xl font-black text-indigo-600">{stats.vocabularySize}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
            <span className="text-slate-400 font-medium">Document Sources</span>
            <p className="text-xl font-black text-violet-600">{stats.uniqueSources}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
            <span className="text-slate-400 font-medium">Vector Similarity Model</span>
            <p className="text-sm font-bold text-emerald-600">TF-IDF + Cosine</p>
          </div>
        </div>
      )}

      {/* Semantic Search Query Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-600" />
            Semantic Corpus Search
          </h2>
          <p className="text-xs text-slate-500">Query the vector store to inspect cosine similarity scores and retrieved context</p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="e.g. 'Backpropagation chain rule intuition analogy' or 'Gradient descent learning rate'"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              id="rag-search-input"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            id="rag-search-submit-btn"
          >
            {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Retrieve Top Chunks
          </button>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Search Results ({searchResults.length} matches)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map(result => (
                <div key={result.id} className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-bold rounded text-[10px]">
                      {result.sourceType}
                    </span>
                    <span className="font-mono text-emerald-600 font-semibold text-[11px]">
                      Score: {result.relevanceScore}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{result.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{result.content}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-indigo-100/60">
                    <span>{result.source}</span>
                    <span>Topic: {result.topicId}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* All Indexed Chunks Catalog */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Indexed Documents Catalog
            </h2>
            <p className="text-xs text-slate-500">All textbook passages, lecture notes, and analogies active in the RAG store</p>
          </div>

          {/* Topic Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedTopicFilter}
              onChange={e => setSelectedTopicFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
              id="rag-topic-filter-select"
            >
              <option value="all">All Topics ({chunks.length})</option>
              <option value="backpropagation">Backpropagation</option>
              <option value="neural-networks">Neural Networks</option>
              <option value="linear-regression">Linear Regression</option>
              <option value="logistic-regression">Logistic Regression</option>
              <option value="gradient-descent">Gradient Descent</option>
              <option value="overfitting-regularization">Overfitting & Regularization</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChunks.map(chunk => (
            <div key={chunk.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2 text-xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 font-semibold rounded text-[10px]">
                    {chunk.sourceType}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{chunk.topicId}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs">{chunk.title}</h4>
                <p className="text-slate-600 line-clamp-4 leading-relaxed text-[11px]">{chunk.content}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                <span className="truncate max-w-[150px]">{chunk.source}</span>
                <span className="flex items-center gap-1 font-mono">{chunk.tags.slice(0, 2).join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Document Ingestion Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" id="doc-upload-backdrop">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200" id="doc-upload-modal">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-600" />
                Index Custom Document into RAG Corpus
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 text-xs">
              {uploadMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-semibold">
                  {uploadMessage}
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Document Title</label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  placeholder="e.g., 'MIT 6.036 Lecture Notes on Attention Mechanisms'"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Source / Citation</label>
                <input
                  type="text"
                  required
                  value={docSource}
                  onChange={e => setDocSource(e.target.value)}
                  placeholder="e.g., 'OpenStax Deep Learning, Chapter 4'"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Target Topic ID</label>
                  <select
                    value={docTopicId}
                    onChange={e => setDocTopicId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer"
                  >
                    <option value="backpropagation">Backpropagation</option>
                    <option value="neural-networks">Neural Networks</option>
                    <option value="linear-regression">Linear Regression</option>
                    <option value="logistic-regression">Logistic Regression</option>
                    <option value="gradient-descent">Gradient Descent</option>
                    <option value="overfitting-regularization">Overfitting</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={docTags}
                    onChange={e => setDocTags(e.target.value)}
                    placeholder="e.g., ml, gradient, calculus"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Educational Text Content (Markdown / Raw Text)</label>
                <textarea
                  required
                  rows={5}
                  value={docContent}
                  onChange={e => setDocContent(e.target.value)}
                  placeholder="Paste educational text passage or analogy here..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow cursor-pointer"
                >
                  {isUploading ? 'Vectorizing...' : 'Index Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
