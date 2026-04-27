import pandas as pd
import os

def check_lengths():
    data_path = 'model/data.xls'
    df = pd.read_csv(data_path)
    df['word_count'] = df['answer'].str.split().str.len()
    print("Top 10 longest responses (word count):")
    print(df.sort_values('word_count', ascending=False)[['word_count', 'answer']].head(10))
    print("\nAverage word count:", df['word_count'].mean())

if __name__ == "__main__":
    check_lengths()
