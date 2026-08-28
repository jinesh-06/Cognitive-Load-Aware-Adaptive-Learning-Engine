"""
Data loader module for loading behavioral interaction datasets.
"""
import os
import pandas as pd

def load_data(filepath="data/cognitive_load_dataset.csv"):
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Dataset file not found at: {filepath}")
    
    df = pd.read_csv(filepath)
    print(f"Loaded dataset with {len(df)} rows and {len(df.columns)} columns.")
    return df
