import React, { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  Activity,
  CheckCircle,
  Code2,
  Cpu,
  Database,
  FileSpreadsheet,
  Layers,
  RefreshCw,
  Sliders,
  Sparkles,
  Zap
} from 'lucide-react';
import { ModelMetrics } from '../types';
import { fetchDatasetSample, fetchModelMetrics, retrainModel } from '../services/api';

export const ModelLabPage: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [datasetSamples, setDatasetSamples] = useState<any[]>([]);
  const [datasetStats, setDatasetStats] = useState<any>(null);
  const [totalSamples, setTotalSamples] = useState(1200);
  const [isRetraining, setIsRetraining] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'train' | 'dataset' | 'predict' | 'rag'>('train');
  const [filterClass, setFilterClass] = useState<string>('all');

  const loadData = async () => {
    try {
      const [m, d] = await Promise.all([fetchModelMetrics(), fetchDatasetSample()]);
      setMetrics(m);
      setDatasetSamples(d.samples);
      setDatasetStats(d.stats);
      setTotalSamples(d.totalCount);
    } catch (e) {
      console.error('Failed to load ML studio data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRetrain = async () => {
    setIsRetraining(true);
    try {
      const updatedMetrics = await retrainModel(1200);
      setMetrics(updatedMetrics);
    } catch (err) {
      console.error('Retrain failed:', err);
    } finally {
      setIsRetraining(false);
    }
  };

  const featureChartData = metrics
    ? metrics.featureImportance
        .map(f => ({
          feature: f.name,
          importance: Number((f.importance * 100).toFixed(1)),
        }))
        .sort((a, b) => b.importance - a.importance)
    : [];

  const filteredSamples = filterClass === 'all'
    ? datasetSamples
    : datasetSamples.filter(s => s.cognitive_load === filterClass);

  return (
    <div className="space-y-8 animate-fade-in pb-12" id="model-lab-container">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600" />
              Machine Learning Studio & Model Evaluation
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">
              Random Forest Ensemble (25 Trees)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supervised multi-class classification on behavioral interaction feature vectors with Z-score scaling.
          </p>
        </div>

        <button
          onClick={handleRetrain}
          disabled={isRetraining}
          id="retrain-model-btn"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
          {isRetraining ? 'Retraining Bootstrap Trees...' : 'Retrain Random Forest Pipeline'}
        </button>
      </div>

      {/* Evaluation Metric Cards */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
            <span className="text-slate-400 text-xs font-semibold">Test Accuracy</span>
            <p className="text-2xl font-black text-emerald-600">{(metrics.accuracy * 100).toFixed(1)}%</p>
            <span className="text-[10px] text-slate-500">Holdout validation (240 samples)</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
            <span className="text-slate-400 text-xs font-semibold">Precision (Macro)</span>
            <p className="text-2xl font-black text-indigo-600">{(metrics.precision.macroAvg * 100).toFixed(1)}%</p>
            <span className="text-[10px] text-slate-500">Unweighted mean across 3 classes</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
            <span className="text-slate-400 text-xs font-semibold">Recall (Macro)</span>
            <p className="text-2xl font-black text-violet-600">{(metrics.recall.macroAvg * 100).toFixed(1)}%</p>
            <span className="text-[10px] text-slate-500">Sensitivity to high cognitive strain</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
            <span className="text-slate-400 text-xs font-semibold">F1-Score (Macro)</span>
            <p className="text-2xl font-black text-slate-900">{(metrics.f1Score.macroAvg * 100).toFixed(1)}%</p>
            <span className="text-[10px] text-slate-500">Harmonic mean of precision/recall</span>
          </div>
        </div>
      )}

      {/* Feature Importance & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance Bar Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                Feature Importance (Gini / MDI)
              </h2>
              <p className="text-xs text-slate-500">Relative contribution to cognitive load prediction</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" unit="%" tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 40]} />
                <YAxis dataKey="feature" type="category" tick={{ fontSize: 10, fill: '#334155' }} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Importance']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Bar dataKey="importance" fill="#6366f1" radius={[0, 6, 6, 0]}>
                  {featureChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : index < 3 ? '#6366f1' : '#818cf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3x3 Confusion Matrix */}
        {metrics && (
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-violet-600" />
                Confusion Matrix (3-Class Multi-Classification)
              </h2>
              <p className="text-xs text-slate-500">Rows: Actual True Class | Columns: Model Prediction</p>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="p-2.5 text-left font-semibold">True \ Pred</th>
                    <th className="p-2.5 font-bold text-emerald-700 bg-emerald-50/50">Pred: LOW</th>
                    <th className="p-2.5 font-bold text-amber-700 bg-amber-50/50">Pred: MED</th>
                    <th className="p-2.5 font-bold text-rose-700 bg-rose-50/50">Pred: HIGH</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {metrics.confusionMatrix.matrix.map((row, rowIdx) => {
                    const classLabels = ['LOW', 'MEDIUM', 'HIGH'];
                    return (
                      <tr key={rowIdx}>
                        <td className="p-3 text-left font-bold text-slate-800">
                          Actual: {classLabels[rowIdx]}
                        </td>
                        {row.map((val, colIdx) => {
                          const isDiagonal = rowIdx === colIdx;
                          return (
                            <td
                              key={colIdx}
                              className={`p-3 font-semibold ${
                                isDiagonal
                                  ? 'bg-indigo-50 text-indigo-900 font-bold'
                                  : val > 0
                                  ? 'text-slate-400'
                                  : 'text-slate-300'
                              }`}
                            >
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 leading-relaxed border border-slate-100">
              💡 <strong>Diagonal cells</strong> indicate correct multi-class classifications. Off-diagonal numbers represent misclassifications.
            </div>
          </div>
        )}
      </div>

      {/* Dataset Explorer */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-4" id="dataset-explorer-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
              Synthetic Behavioral Interaction Dataset ({totalSamples} Rows)
            </h2>
            <p className="text-xs text-slate-500">Stored at <code>data/cognitive_load_dataset.csv</code></p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Filter Class:</span>
            <select
              value={filterClass}
              onChange={e => setFilterClass(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
            >
              <option value="all">All ({datasetSamples.length} loaded)</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-72 border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="p-2.5">Dwell (s)</th>
                <th className="p-2.5">Scroll Spd</th>
                <th className="p-2.5">Re-reads</th>
                <th className="p-2.5">Backtracks</th>
                <th className="p-2.5">Hesitation</th>
                <th className="p-2.5">Accuracy</th>
                <th className="p-2.5">Target Class</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSamples.slice(0, 50).map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80">
                  <td className="p-2.5">{row.time_per_page}</td>
                  <td className="p-2.5">{row.scroll_speed}</td>
                  <td className="p-2.5">{row.number_of_re_reads}</td>
                  <td className="p-2.5">{row.backtracking_count}</td>
                  <td className="p-2.5">{row.quiz_hesitation_time}s</td>
                  <td className="p-2.5">{row.quiz_accuracy}%</td>
                  <td className="p-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.cognitive_load === 'LOW'
                          ? 'bg-emerald-100 text-emerald-800'
                          : row.cognitive_load === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {row.cognitive_load}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pipeline Source Code Reference Viewer */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Machine Learning & Semantic Pipeline Architecture
              </h2>
              <p className="text-xs text-slate-400">Standalone scripts runnable via <code>python -m backend.ml.train_model</code></p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setActiveCodeTab('train')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeCodeTab === 'train' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              train_model.py
            </button>
            <button
              onClick={() => setActiveCodeTab('dataset')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeCodeTab === 'dataset' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              generate_dataset.py
            </button>
            <button
              onClick={() => setActiveCodeTab('predict')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeCodeTab === 'predict' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              predict.py
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-80 leading-relaxed">
          {activeCodeTab === 'train' && (
            <pre>
{`# backend/ml/train_model.py
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from .data_loader import load_data
from .preprocessing import preprocess_and_split

def train_and_evaluate(dataset_path="data/cognitive_load_dataset.csv"):
    df = load_data(dataset_path)
    X_train, X_test, y_train, y_test, scaler = preprocess_and_split(df)
    
    model = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(classification_report(y_test, y_pred))
    return model`}
            </pre>
          )}

          {activeCodeTab === 'dataset' && (
            <pre>
{`# scripts/generate_dataset.py
import numpy as np
import pandas as pd

def generate_cognitive_load_dataset(num_samples=1200):
    records = []
    for i in range(num_samples):
        # Sample realistic distributions for LOW, MEDIUM, HIGH load
        # time_per_page, scroll_speed, re_reads, backtracks, hesitation...
        pass
    df = pd.DataFrame(records)
    df.to_csv("data/cognitive_load_dataset.csv", index=False)`}
            </pre>
          )}

          {activeCodeTab === 'predict' && (
            <pre>
{`# backend/ml/predict.py
import joblib

class CognitiveLoadPredictor:
    def __init__(self, model_path="backend/models/random_forest_model.joblib"):
        self.artifacts = joblib.load(model_path)
        self.model = self.artifacts['model']
        self.scaler = self.artifacts['scaler']

    def predict(self, features_dict):
        raw_vector = [features_dict.get(k) for k in self.artifacts['feature_names']]
        scaled = self.scaler.transform([raw_vector])
        pred_class = self.model.predict(scaled)[0]
        return {"cognitive_load": pred_class}`}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
