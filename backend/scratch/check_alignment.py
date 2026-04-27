import joblib
import pandas as pd
import os

def check_alignment():
    model_dir = 'model'
    vectorizer_path = os.path.join(model_dir, 'vectorizer.pkl')
    matrix_path = os.path.join(model_dir, 'matrix.pkl')
    data_path = os.path.join(model_dir, 'data.xls')

    print(f"Loading matrix...")
    matrix = joblib.load(matrix_path)
    print(f"Matrix shape: {matrix.shape}")
    
    print(f"Loading data...")
    df = pd.read_csv(data_path)
    print(f"Dataframe shape: {df.shape}")
    
    if matrix.shape[0] != df.shape[0]:
        print(f"CRITICAL ERROR: Matrix has {matrix.shape[0]} rows but Dataframe has {df.shape[0]} rows!")
        print("This misalignment is why you are getting wrong responses.")
    else:
        print("Row counts match.")

if __name__ == "__main__":
    check_alignment()
