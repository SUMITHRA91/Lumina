import joblib
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import os

def check_content_alignment():
    model_dir = 'model'
    vectorizer = joblib.load(os.path.join(model_dir, 'vectorizer.pkl'))
    matrix = joblib.load(os.path.join(model_dir, 'matrix.pkl'))
    df = pd.read_csv(os.path.join(model_dir, 'data.xls'))

    print(f"Testing alignment for 5 random rows...")
    import random
    indices = random.sample(range(len(df)), 5)
    
    for i in indices:
        q = df['question'].iloc[i]
        q_vec = vectorizer.transform([q])
        sims = cosine_similarity(q_vec, matrix)
        best_idx = sims.argmax()
        print(f"Row {i}: Question='{q[:50]}...'")
        print(f"  Best match index: {best_idx} (Similarity: {sims[0][best_idx]:.4f})")
        if i == best_idx:
            print("  MATCH: OK")
        else:
            print(f"  MISMATCH: Expected {i}, got {best_idx}")
            print(f"  Actual question at {best_idx}: '{df['question'].iloc[best_idx][:50]}...'")

if __name__ == "__main__":
    check_content_alignment()
