import re

# Sample SQL statements





# Read data from out.txt
with open('out9.txt', 'r') as file:
    data = file.readlines()

# Format data and write to out1.txt
with open('out10.txt', 'w') as out_file:
    for index, item in enumerate(data, start=11):
        formatted_data = f"INSERT INTO STATION(STATION_ID, STATION_NAME) VALUES({index}, '{item.strip()}');\n"
        out_file.write(formatted_data)

print("Formatted data written to out1.txt successfully.")
