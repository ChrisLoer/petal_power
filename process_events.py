import pandas as pd
from datetime import datetime
import sys

def process_events(input_csv_path):
    # Read the CSV file
    df = pd.read_csv(input_csv_path)
    
    # Filter rows where event_id_cnty starts with "SUD"
    df = df[df['event_id_cnty'].str.startswith('SUD')]
    
    # Convert date strings to datetime objects and then calculate days since April 1 2024
    base_date = datetime(2024, 4, 1)
    df['event_date'] = pd.to_datetime(df['event_date'], format='%d %B %Y')
    df['event_date'] = (df['event_date'] - base_date).dt.days
    
    return df

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python process_events.py <input_csv_path>")
        sys.exit(1)
        
    input_file = sys.argv[1]
    result_df = process_events(input_file)
    print(result_df)
    
    # Save to a new CSV
    result_df.to_csv("processed_events.csv", index=False) 
