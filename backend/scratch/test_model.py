import joblib
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import os

def test_model():
    model_dir = 'model'
    vectorizer_path = os.path.join(model_dir, 'vectorizer.pkl')
    matrix_path = os.path.join(model_dir, 'matrix.pkl')
    data_path = os.path.join(model_dir, 'data.xls')

    print(f"Loading vectorizer...")
    vectorizer = joblib.load(vectorizer_path)
    print(f"Loading matrix...")
    matrix = joblib.load(matrix_path)
    
    print(f"Loading data from {data_path}...")
    df = None
    try:
        df = pd.read_excel(data_path, engine='xlrd')
        print("Loaded with xlrd")
    except:
        try:
            df = pd.read_excel(data_path, engine='openpyxl')
            print("Loaded with openpyxl")
        except:
            try:
                # Maybe it's a CSV actually?
                df = pd.read_csv(data_path)
                print("Loaded as CSV")
            except Exception as e:
                print(f"All attempts failed: {e}")
                return

    print(f"Data loaded. Shape: {df.shape}")
    print(f"Columns: {df.columns.tolist()}")

    # Test query
    query = "I am feeling very sad today"
    query_vec = vectorizer.transform([query])
    similarities = cosine_similarity(query_vec, matrix)
    best_index = similarities.argmax()
    print(f"Best match index: {best_index} with similarity {similarities[0][best_index]}")
    
    if not df.empty:
        print(f"Sample data row {best_index}:")
        print(df.iloc[best_index])

if __name__ == "__main__":
    test_model()
