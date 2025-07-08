import pandas as pd
import numpy as np

my_dict = {}
distance_matrix = []
class_map = {}
train_map = {}
excel_file = 'fare-final.xlsx'
excel_file_2 = 'schedule.xlsx'

df = pd.read_excel(excel_file, skiprows=1)
dfinclude1 = pd.read_excel(excel_file)

df2 = pd.read_excel(excel_file_2, skiprows=0)
dfinclude2 = pd.read_excel(excel_file_2)


# Read data from out1.txt and load it into a dictionary
station_map = {}
with open('out.txt', 'r') as file:
    for index, line in enumerate(file, start=1):
        station_name = line.strip().upper()
        station_map[station_name] = index

print("Data loaded into dictionary successfully.")
print("Station Map:", station_map)



#f2= open('out3.txt', 'w')
#f4= open('out4.txt', 'w')
#f5= open('out5.txt', 'w')



for station_name, station_id in station_map.items():
    print(f"Station Name: {station_name}, Station ID: {station_id}")

for index, row in df.iterrows():
    station_from = row.get('From').strip().upper()
    station_to = row.get('To').strip().upper()

    if station_from not in station_map:
        new_station_id = len(station_map) + 1
        station_map[station_from] = new_station_id

    if station_to not in station_map:
        new_station_id = len(station_map) + 1
        station_map[station_to] = new_station_id
            #if does not exist, add it to the dictionary
    
    

    for ind in ['2nd General', '2nd Mail', 'Commuter', 'Sulav', 'Shovon', 'Shovon Chair', '1st Chair/ Seat', '1st Berth', 'Snigdha', 'AC seat']:
        class_map[ind] = class_map.get(ind, len(class_map) + 1) 
        
    
    for fare_type in ['2nd General', '2nd Mail', 'Commuter', 'Sulav', 'Shovon', 'Shovon Chair', '1st Chair/ Seat', '1st Berth']:
            for ind,nr in dfinclude1.iterrows():
                if index == (ind-1):
                    st = nr.get(fare_type)
                    insert_statement = f"INSERT INTO farelist (class_id, source, destination, fare) VALUES ({class_map[fare_type]}, {station_map[station_from]}, {station_map[station_to]}, {st});"
                    #f2.write(f'{insert_statement}\n')
        
    snigdha_fare = row.get('Payment')
    #print(f'from: {station_from}, to: {station_to}, fare: {snigdha_fare}')
    insert_statement = f"INSERT INTO farelist (class_id, source, destination, fare)  VALUES ({class_map['Snigdha']}, {station_map[station_from]}, {station_map[station_to]}, {snigdha_fare});"
    #f2.write(f'{insert_statement}\n')

    ac_fare = row.get('Pay')
    #print(f'from: {station_from}, to: {station_to}, acfare: {ac_fare}')
    insert_statement = f"INSERT INTO farelist (class_id, source, destination, fare)  VALUES ({class_map['AC seat']}, {station_map[station_from]}, {station_map[station_to]}, {ac_fare});"
    #f2.write(f'{insert_statement}\n')





for index, row in df2.iterrows():
    trainID = row.get('train_id')
    trainName = row.get('train_name')
    
    
    station = row.get('station_name').strip().upper()
    sequence = row.get('sequence')
    arrival = row.get('arrival_time')
    departure = row.get('departure_time')

    if station not in station_map:
        new_station_id = len(station_map) + 1
        station_map[station] = new_station_id
        
    if station in station_map:
        insert_statement = f"INSERT INTO schedule (train_id, station_id, route_id, arrival, departure) VALUES ({trainID}, {station_map[station]}, 11111, '{arrival}', '{departure}');"

        #f4.write(f'{insert_statement}\n')
        insert_statement = f"INSERT INTO route_stations (route_id, station_id, sequence_number) VALUES (1111, {station_map[station]}, {sequence});"
        #f5.write(f'{insert_statement}\n')
        #print(insert_statement)
        
            

#f2.close()
#f4.close()
#f5.close()
f1= open ('out9.txt', 'w')
# print("done bitch")
for station_name, station_id in station_map.items():
    print(f"Station Name: {station_name}, Station ID: {station_id}")
    f1.write(f'{station_name}\n')

f1.close()
