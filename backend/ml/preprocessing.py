"""
Preprocessing and feature scaling pipeline for behavioral telemetry signals.
"""
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

FEATURE_COLUMNS = [
    'time_per_page',
    'scroll_speed',
    'number_of_re_reads',
    'backtracking_count',
    'quiz_hesitation_time',
    'quiz_attempts',
    'quiz_accuracy',
    'session_duration'
]

TARGET_COLUMN = 'cognitive_load'

def preprocess_and_split(df, test_size=0.2, random_state=42):
    # Handle missing values if any
    df = df.dropna()
    
    X = df[FEATURE_COLUMNS].values
    y = df[TARGET_COLUMN].values
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    return X_train_scaled, X_test_scaled, y_train, y_test, scaler
