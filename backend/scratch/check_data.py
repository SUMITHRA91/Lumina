import pandas as pd
import os

def check_data():
    data_path = 'model/data.xls'
    df = pd.read_csv(data_path)
    print("First 10 rows:")
    print(df.head(10))
    print("\nColumns and non-null counts:")
    print(df.info())
    
    # Check for rows with nulls
    null_rows = df[df.isnull().any(axis=1)]
    print(f"\nNumber of rows with null values: {len(null_rows)}")
    if not null_rows.empty:
        print("Sample null rows:")
        print(null_rows.head())

if __name__ == "__main__":
    check_data()
