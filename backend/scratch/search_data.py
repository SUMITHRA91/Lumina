import pandas as pd
import os

def search_data():
    data_path = 'model/data.xls'
    df = pd.read_csv(data_path)
    match = df[df['question'].str.contains('pedophile', case=False, na=False)]
    print(f"Found {len(match)} matches for 'pedophile':")
    print(match)

if __name__ == "__main__":
    search_data()
