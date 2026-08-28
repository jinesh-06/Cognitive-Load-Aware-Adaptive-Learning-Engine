"""
Cognitive Load Dataset Generator
Generates realistic synthetic behavioral interaction data for training cognitive load classifiers.
"""

import os
import random
import numpy as np
import pandas as pd

def generate_cognitive_load_dataset(num_samples=1200, output_path="data/cognitive_load_dataset.csv"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    records = []
    
    np.random.seed(42)
    random.seed(42)

    for i in range(1, num_samples + 1):
        r = random.random()
        if r < 0.35:
            target_class = "LOW"
            time_per_page = np.clip(np.random.normal(65, 20), 20, 150)
            scroll_speed = np.clip(np.random.normal(380, 70), 180, 650)
            number_of_re_reads = int(np.clip(np.random.normal(0.8, 0.9), 0, 3))
            backtracking_count = int(np.clip(np.random.normal(0.5, 0.7), 0, 2))
            quiz_hesitation_time = np.clip(np.random.normal(6.5, 3), 1.5, 18)
            quiz_attempts = int(np.clip(np.random.normal(1.1, 0.3), 1, 2))
            quiz_accuracy = np.clip(np.random.normal(92, 7), 75, 100)
            session_duration = np.clip(np.random.normal(400, 150), 100, 1200)
        elif r < 0.70:
            target_class = "MEDIUM"
            time_per_page = np.clip(np.random.normal(140, 35), 70, 240)
            scroll_speed = np.clip(np.random.normal(210, 50), 100, 350)
            number_of_re_reads = int(np.clip(np.random.normal(2.6, 1.2), 1, 5))
            backtracking_count = int(np.clip(np.random.normal(1.8, 1.0), 0, 4))
            quiz_hesitation_time = np.clip(np.random.normal(18, 6), 7, 35)
            quiz_attempts = int(np.clip(np.random.normal(1.9, 0.7), 1, 4))
            quiz_accuracy = np.clip(np.random.normal(72, 11), 45, 90)
            session_duration = np.clip(np.random.normal(750, 200), 250, 1800)
        else:
            target_class = "HIGH"
            time_per_page = np.clip(np.random.normal(260, 60), 140, 480)
            scroll_speed = np.clip(np.random.normal(95, 30), 25, 180)
            number_of_re_reads = int(np.clip(np.random.normal(5.2, 1.8), 3, 11))
            backtracking_count = int(np.clip(np.random.normal(4.1, 1.6), 2, 8))
            quiz_hesitation_time = np.clip(np.random.normal(38, 12), 18, 75)
            quiz_attempts = int(np.clip(np.random.normal(3.2, 1.1), 2, 6))
            quiz_accuracy = np.clip(np.random.normal(42, 14), 10, 68)
            session_duration = np.clip(np.random.normal(1200, 350), 500, 2800)

        # 5% realistic label noise
        final_label = target_class
        if random.random() < 0.05:
            options = ["LOW", "MEDIUM", "HIGH"]
            options.remove(target_class)
            final_label = random.choice(options)

        records.append({
            "time_per_page": round(float(time_per_page), 2),
            "scroll_speed": round(float(scroll_speed), 2),
            "number_of_re_reads": number_of_re_reads,
            "backtracking_count": backtracking_count,
            "quiz_hesitation_time": round(float(quiz_hesitation_time), 2),
            "quiz_attempts": quiz_attempts,
            "quiz_accuracy": round(float(quiz_accuracy), 2),
            "session_duration": round(float(session_duration), 2),
            "cognitive_load": final_label
        })

    df = pd.DataFrame(records)
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} samples saved to {output_path}")
    return df

if __name__ == "__main__":
    generate_cognitive_load_dataset()
