"""
Cognitive Load Prediction Module
Loads trained model and executes real-time inference on incoming behavioral vectors.
"""
import joblib
import numpy as np
from .preprocessing import FEATURE_COLUMNS

class CognitiveLoadPredictor:
    def __init__(self, model_path="backend/models/random_forest_model.joblib"):
        self.artifacts = joblib.load(model_path)
        self.model = self.artifacts['model']
        self.scaler = self.artifacts['scaler']
        self.classes = self.artifacts['classes']
        self.feature_names = self.artifacts['feature_names']

    def predict(self, features_dict):
        raw_vector = [features_dict.get(feat, 0) for feat in self.feature_names]
        scaled_vector = self.scaler.transform([raw_vector])
        
        predicted_class = self.model.predict(scaled_vector)[0]
        probabilities = self.model.predict_proba(scaled_vector)[0]
        
        proba_dict = {cls_name: round(float(prob), 4) for cls_name, prob in zip(self.classes, probabilities)}
        confidence = proba_dict[predicted_class]
        
        return {
            "cognitive_load": predicted_class,
            "confidence": confidence,
            "probabilities": proba_dict
        }
