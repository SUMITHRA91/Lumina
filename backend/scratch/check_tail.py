import pandas as pd
import os

def check_tail():
    data_path = 'model/data.xls'
    df = pd.read_csv(data_path)
    print("Last 10 rows:")
    print(df.tail(10))
    print(f"\nTotal rows: {len(df)}")

if __name__ == "__main__":
    check_tail()
