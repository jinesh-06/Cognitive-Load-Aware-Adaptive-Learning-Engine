"""
Model Training and Evaluation Pipeline
Trains Random Forest, Decision Tree, Logistic Regression, or XGBoost classifier
and outputs comprehensive evaluation metrics.
"""
import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_recall_fscore_support

from .data_loader import load_data
from .preprocessing import preprocess_and_split, FEATURE_COLUMNS

def train_and_evaluate(dataset_path="data/cognitive_load_dataset.csv", model_output_path="backend/models/random_forest_model.joblib"):
    os.makedirs(os.path.dirname(model_output_path), exist_ok=True)
    
    df = load_data(dataset_path)
    X_train, X_test, y_train, y_test, scaler = preprocess_and_split(df)
    
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        min_samples_split=4,
        random_state=42
    )
    
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred, labels=['LOW', 'MEDIUM', 'HIGH'])
    prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_pred, labels=['LOW', 'MEDIUM', 'HIGH'], average=None)
    
    print("\n" + "="*50)
    print("       MODEL EVALUATION RESULTS (TEST SET)       ")
    print("="*50)
    print(f"Overall Accuracy: {acc:.4f}")
    print("\nConfusion Matrix [LOW, MEDIUM, HIGH]:")
    print(cm)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Feature importances
    importances = model.feature_importances_
    print("Feature Importances:")
    for feat, imp in sorted(zip(FEATURE_COLUMNS, importances), key=lambda x: x[1], reverse=True):
        print(f"  - {feat:22s}: {imp:.4f}")
        
    # Save artifacts
    artifacts = {
        'model': model,
        'scaler': scaler,
        'feature_names': FEATURE_COLUMNS,
        'classes': model.classes_.tolist()
    }
    joblib.dump(artifacts, model_output_path)
    print(f"\nModel pipeline saved to: {model_output_path}")
    return artifacts

if __name__ == "__main__":
    train_and_evaluate()
