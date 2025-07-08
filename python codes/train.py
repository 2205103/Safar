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

f4= open('schedule.txt', 'w')

station_to= 'Dhaka Biman Bondor'.upper()
my_dict[station_to] = my_dict.get(station_to, len(my_dict) + 1)

for ind in ['2nd General', '2nd Mail', 'Commuter', 'Sulav', 'Shovon', 'Shovon Chair', '1st Chair/ Seat', '1st Berth', 'Snigdha', 'AC seat']:
    class_map[ind] = class_map.get(ind, len(class_map) + 1) 



for index, row in df.iterrows():
    station_from = row.get('From').strip().upper()
    station_to = row.get('To').strip().upper()
    my_dict[station_from] = my_dict.get(station_from, len(my_dict) + 1)
    my_dict[station_to] = my_dict.get(station_to, len(my_dict) + 1)






for index, row in df2.iterrows():
    trainID = row.get('train_id')
    trainName = row.get('train_name')
    
    
    station = row.get('station_name').strip().upper()
    sequence = row.get('sequence')
    arrival = row.get('arrival_time')
    departure = row.get('departure_time')
        
    if station in my_dict:
        insert_statement = f"INSERT INTO schedule (train_id, station_id, sequence, arrival, departure) VALUES ({trainID}, {my_dict[station]}, {sequence}, '{arrival}', '{departure}');"
        f4.write(f'{insert_statement}\n')
        print(insert_statement)
        
        
            
                

f4.close()
print("done bitch")






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



f=open('station.txt', 'w')
f1= open('distance.txt', 'w')
f2= open('fare.txt', 'w')
f3= open('class.txt', 'w')
f4= open('schedule.txt', 'w')
f5= open('train.txt', 'w')

station_to= 'Dhaka Biman Bondor'.upper()
my_dict[station_to] = my_dict.get(station_to, len(my_dict) + 1)

for ind in ['2nd General', '2nd Mail', 'Commuter', 'Sulav', 'Shovon', 'Shovon Chair', '1st Chair/ Seat', '1st Berth', 'Snigdha', 'AC seat']:
    class_map[ind] = class_map.get(ind, len(class_map) + 1) 
    insert_statement = f"INSERT INTO class (class_id, class_name) VALUES ({class_map[ind]}, '{ind}');"
    f3.write(f'{insert_statement}\n')

for index, row in df.iterrows():
    station_from = row.get('From').strip().upper()
    station_to = row.get('To').strip().upper()
    my_dict[station_from] = my_dict.get(station_from, len(my_dict) + 1)
    my_dict[station_to] = my_dict.get(station_to, len(my_dict) + 1)
    

    for fare_type in ['km']:
        for ind, nr in dfinclude1.iterrows():
            if index == (ind-1):
                distance = nr.get(fare_type)
                insert_statement = f"INSERT INTO distance (source, destination, track_length) VALUES ({my_dict[station_from]}, {my_dict[station_to]}, {distance});"
                f1.write(f'{insert_statement}\n')
        
    
    for fare_type in ['2nd General', '2nd Mail', 'Commuter', 'Sulav', 'Shovon', 'Shovon Chair', '1st Chair/ Seat', '1st Berth']:
            for ind,nr in dfinclude1.iterrows():
                if index == (ind-1):
                    st = nr.get(fare_type)
                    insert_statement = f"INSERT INTO farelist (class_id, source, destination, fare) VALUES ({class_map[fare_type]}, {my_dict[station_from]}, {my_dict[station_to]}, {st});"
                    f2.write(f'{insert_statement}\n')
        
    snigdha_fare = row.get('Payment')
    print(f'from: {station_from}, to: {station_to}, fare: {snigdha_fare}')
    insert_statement = f"INSERT INTO farelist (class_id, source, destination, fare)  VALUES ({class_map['Snigdha']}, {my_dict[station_from]}, {my_dict[station_to]}, {snigdha_fare});"
    f2.write(f'{insert_statement}\n')

    ac_fare = row.get('Pay')
    print(f'from: {station_from}, to: {station_to}, acfare: {ac_fare}')
    insert_statement = f"INSERT INTO farelist (class_id, source, destination, fare)  VALUES ({class_map['AC seat']}, {my_dict[station_from]}, {my_dict[station_to]}, {ac_fare});"
    f2.write(f'{insert_statement}\n')

for station, i in my_dict.items():
    insert_statement = f"INSERT INTO station (station_id, station_name) VALUES ({i}, '{station}');"
    f.write(f'{insert_statement}\n')




for index, row in df2.iterrows():
    trainID = row.get('train_id')
    trainName = row.get('train_name')
    
    
    station = row.get('station_name').strip().upper()
    sequence = row.get('sequence')
    arrival = row.get('arrival_time')
    departure = row.get('departure_time')
        
    if station in my_dict:
        insert_statement = f"INSERT INTO schedule (train_id, station_id, sequence, arrival, departure) VALUES ({trainID}, {my_dict[station]}, {sequence}, '{arrival}', '{departure}');"
        f4.write(f'{insert_statement}\n')
        print(insert_statement)
        
            
                
for train, i in train_map.items():
    insert_statement = f"INSERT INTO train (train_id, train_name) VALUES ({i}, '{train}');"
    f5.write(f'{insert_statement}\n')

f.close()
f1.close()
f2.close()
f3.close()
f4.close()
f5.close()
print("done bitch")