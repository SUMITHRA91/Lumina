import pandas as pd
import os

def search_question():
    data_path = 'model/data.xls'
    df = pd.read_csv(data_path)
    q = "How does a person start the counseling process?"
    matches = df[df['question'] == q]
    print(f"Found {len(matches)} matches for '{q}':")
    for idx, row in matches.iterrows():
        print(f"Index {idx}: Answer='{row['answer'][:100]}...'")

if __name__ == "__main__":
    search_question()
