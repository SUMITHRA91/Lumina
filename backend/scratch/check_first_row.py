import joblib
import pandas as pd
import os
from sklearn.metrics.pairwise import cosine_similarity

def check_first_row():
    model_dir = 'model'
    vectorizer = joblib.load(os.path.join(model_dir, 'vectorizer.pkl'))
    matrix = joblib.load(os.path.join(model_dir, 'matrix.pkl'))
    
    # Try with header=0 (default)
    df_h0 = pd.read_csv(os.path.join(model_dir, 'data.xls'))
    # Try with header=None
    df_hn = pd.read_csv(os.path.join(model_dir, 'data.xls'), header=None)

    first_row_vec = matrix[0]
    
    # Check if first row of matrix matches first row of df_h0['question']
    q0_h0 = df_h0['question'].iloc[0]
    q0_h0_vec = vectorizer.transform([q0_h0])
    sim_h0 = cosine_similarity(q0_h0_vec, first_row_vec)[0][0]
    
    # Check if first row of matrix matches first row of df_hn[0]
    q0_hn = df_hn[0].iloc[0]
    q0_hn_vec = vectorizer.transform([q0_hn])
    sim_hn = cosine_similarity(q0_hn_vec, first_row_vec)[0][0]
    
    print(f"Similarity with first row of DF (header=0): {sim_h0:.4f}")
    print(f"First question (header=0): {q0_h0[:50]}...")
    
    print(f"Similarity with first row of DF (header=None): {sim_hn:.4f}")
    print(f"First question (header=None): {q0_hn[:50]}...")

if __name__ == "__main__":
    check_first_row()
