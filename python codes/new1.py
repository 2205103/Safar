import pandas as pd
import numpy as np
import re

station_map = {}
with open('out.txt', 'r') as file:
    for index, line in enumerate(file, start=1):
        station_name = line.strip().upper()
        station_map[station_name] = index

print("Data loaded into dictionary successfully.")
print("Station Map:", station_map)
    

with open('lmao.txt', 'r') as file:
    data = file.readlines()

with open('out100.txt', 'w') as out_file:
    for index, item in enumerate(data, start=5):
        formatted_data = f"INSERT INTO BOARDING_STATION(B_STATION_ID, B_STATION_NAME, STATION_ID) VALUES({index}, '{item.strip()} RAILWAY STATION', {station_map[item.strip().upper()]});\n"
        out_file.write(formatted_data)
print("Formatted data written to out100.txt successfully.")
