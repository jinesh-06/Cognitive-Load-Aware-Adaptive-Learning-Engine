"""
FastAPI Backend Application for Cognitive Load-Aware Adaptive Learning Engine.
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os

app = FastAPI(title="Cognitive Load-Aware Adaptive Learning Engine", version="1.0.0")

class BehavioralFeaturePayload(BaseModel):
    time_per_page: float = 90.0
    scroll_speed: float = 250.0
    number_of_re_reads: int = 1
    backtracking_count: int = 1
    quiz_hesitation_time: float = 10.0
    quiz_attempts: int = 1
    quiz_accuracy: float = 80.0
    session_duration: float = 600.0

class PredictionResponse(BaseModel):
    cognitive_load: str
    confidence: float
    probabilities: Dict[str, float]

# Initialize machine learning model predictor with rule-based fallback
predictor = None
try:
    from backend.ml.predict import CognitiveLoadPredictor
    model_path = "backend/models/random_forest_model.joblib"
    if os.path.exists(model_path):
        predictor = CognitiveLoadPredictor(model_path)
        print(f"[FastAPI Engine] Loaded Random Forest model pipeline from {model_path}")
    else:
        print(f"[FastAPI Engine] Warning: Model file not found at {model_path}. Running with rule-based fallback.")
except Exception as e:
    print(f"[FastAPI Engine] Warning: Error initializing CognitiveLoadPredictor: {e}. Running with rule-based fallback.")

@app.get("/")
def read_root():
    return {"message": "Cognitive Load-Aware Adaptive Learning Engine API is active"}

@app.post("/api/predict-load", response_model=PredictionResponse)
def predict_load(payload: BehavioralFeaturePayload):
    # Try using ML model first
    if predictor is not None:
        try:
            features = payload.model_dump()
            prediction = predictor.predict(features)
            return prediction
        except Exception as err:
            print(f"[FastAPI Engine] Inference error: {err}. Falling back to rule-based response.")

    # Rule/ML proxy fallback response
    load = "LOW"
    conf = 0.85
    if payload.time_per_page > 200 or payload.quiz_accuracy < 50 or payload.number_of_re_reads >= 4:
        load = "HIGH"
        conf = 0.89
    elif payload.time_per_page > 110 or payload.quiz_accuracy < 75 or payload.number_of_re_reads >= 2:
        load = "MEDIUM"
        conf = 0.78
        
    return {
        "cognitive_load": load,
        "confidence": conf,
        "probabilities": {
            "LOW": 0.1 if load != "LOW" else 0.85,
            "MEDIUM": 0.8 if load == "MEDIUM" else 0.15,
            "HIGH": 0.89 if load == "HIGH" else 0.05
        }
    }

