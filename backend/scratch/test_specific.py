import joblib
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import os

def test_specific_query():
    model_dir = 'model'
    vectorizer = joblib.load(os.path.join(model_dir, 'vectorizer.pkl'))
    matrix = joblib.load(os.path.join(model_dir, 'matrix.pkl'))
    df = pd.read_csv(os.path.join(model_dir, 'data.xls'))

    query = "How does a person start the counseling process?"
    print(f"Query: {query}")
    
    query_vec = vectorizer.transform([query])
    sims = cosine_similarity(query_vec, matrix)
    best_idx = sims.argmax()
    score = sims[0][best_idx]
    
    print(f"Best Match Index: {best_idx}, Score: {score:.4f}")
    print(f"Matched Question: {df['question'].iloc[best_idx]}")
    print(f"Response: {df['answer'].iloc[best_idx]}")

if __name__ == "__main__":
    test_specific_query()
