import random
import csv

# Sample trains data with stations order (order_of_stations)
trains = [
    {"route_id": 107, "train_code": 701, "train_name": "Subarna Express", "stations": [9, 18, 12, 27, 1, 4, 31, 45, 16, 2, 43, 15, 14]},
    {"route_id": 118, "train_code": 702, "train_name": "Subarna Express", "stations": [14, 15, 43, 2, 16, 45, 31, 4, 1, 27, 12, 18, 9]},
    {"route_id": 120, "train_code": 705, "train_name": "Ekota Express", "stations": [14, 24, 41, 22, 20, 35, 5, 38, 17]},
    {"route_id": 136, "train_code": 706, "train_name": "Ekota Express", "stations": [17, 38, 5, 35, 20, 22, 41, 24, 14]},
    {"route_id": 119, "train_code": 707, "train_name": "Tista Express", "stations": [14, 15, 24, 19, 30, 21, 13]},
    {"route_id": 115, "train_code": 708, "train_name": "Tista Express", "stations": [13, 21, 30, 19, 24, 15, 14]},
    {"route_id": 133, "train_code": 709, "train_name": "Parabat Express", "stations": [14, 15, 43, 2, 16, 45, 31, 4, 1, 27, 12, 18, 40]},
    {"route_id": 157, "train_code": 710, "train_name": "Parabat Express", "stations": [40, 27, 1, 4, 45, 16, 15, 18, 12, 6, 31, 2, 43, 14]},
    {"route_id": 148, "train_code": 711, "train_name": "Upokul Express", "stations": [33, 27, 38, 5, 35, 20, 22, 41, 24, 14]},
    {"route_id": 128, "train_code": 712, "train_name": "Upokul Express", "stations": [14, 24, 41, 22, 20, 35, 5, 38, 27, 33]},
    {"route_id": 157, "train_code": 718, "train_name": "Joyantika Express", "stations": [40, 27, 1, 4, 45, 16, 15, 18, 12, 6, 31, 2, 43, 14]},
    {"route_id": 108, "train_code": 719, "train_name": "Paharika Express", "stations": [9, 6, 31, 16, 2, 43, 14, 15, 45, 4, 1, 27, 12, 18, 40]},
    {"route_id": 107, "train_code": 721, "train_name": "Mohanagar Provati", "stations": [9, 18, 12, 27, 1, 4, 31, 45, 16, 2, 43, 15, 14]},
    {"route_id": 118, "train_code": 722, "train_name": "Mohanagar Godhuli", "stations": [14, 15, 43, 2, 16, 45, 31, 4, 1, 27, 12, 18, 9]},
    {"route_id": 108, "train_code": 723, "train_name": "Udayan Express", "stations": [9, 6, 31, 16, 2, 43, 14, 15, 45, 4, 1, 27, 12, 18, 40]},
    {"route_id": 113, "train_code": 726, "train_name": "Sundarban Express", "stations": [11, 23, 25]},
    {"route_id": 114, "train_code": 727, "train_name": "Rupsha Express", "stations": [11, 23, 25, 35, 5, 38, 17, 37]},
    {"route_id": 113, "train_code": 728, "train_name": "Rupsha Express", "stations": [11, 23, 25]},
    {"route_id": 150, "train_code": 731, "train_name": "Barendra Express", "stations": [35, 5, 38, 17, 10]},
    {"route_id": 111, "train_code": 732, "train_name": "Barendra Express", "stations": [10, 17, 38, 5, 35]},
    {"route_id": 150, "train_code": 733, "train_name": "Titumir Express", "stations": [35, 5, 38, 17, 10]},
    {"route_id": 111, "train_code": 734, "train_name": "Titumir Express", "stations": [10, 17, 38, 5, 35]},
    {"route_id": 123, "train_code": 737, "train_name": "Egarosindhur Provati", "stations": [14, 24, 41, 22, 20, 35, 5, 38, 26]},
    {"route_id": 133, "train_code": 739, "train_name": "Upaban Express", "stations": [14, 15, 43, 2, 16, 45, 31, 4, 1, 27, 12, 18, 40]},
    {"route_id": 143, "train_code": 750, "train_name": "Egarosindhur Godhuli", "stations": [26, 38, 5, 35, 20, 22, 41, 24, 14]},
    {"route_id": 126, "train_code": 751, "train_name": "Lalmoni Express", "stations": [14, 24, 41, 22, 20, 35, 5, 38, 17, 37, 28]},
    {"route_id": 146, "train_code": 752, "train_name": "Lalmoni Express", "stations": [28, 37, 17, 38, 5, 35, 20, 22, 41, 24, 14]},
    {"route_id": 130, "train_code": 753, "train_name": "Silkcity Express", "stations": [14, 24, 41, 22, 20, 35]},
    {"route_id": 151, "train_code": 754, "train_name": "Silkcity Express", "stations": [35, 20, 22, 41, 24, 14]},
    {"route_id": 140, "train_code": 755, "train_name": "Madhumati Express", "stations": [20, 35]},
    {"route_id": 152, "train_code": 756, "train_name": "Madhumati Express", "stations": [35, 20]},
    {"route_id": 130, "train_code": 759, "train_name": "Padma Express", "stations": [14, 24, 41, 22, 20, 35]},
    {"route_id": 151, "train_code": 760, "train_name": "Padma Express", "stations": [35, 20, 22, 41, 24, 14]},
    {"route_id": 140, "train_code": 761, "train_name": "Sagardari Express", "stations": [20, 35]},
    {"route_id": 152, "train_code": 762, "train_name": "Sagardari Express", "stations": [35, 20]},
    {"route_id": 139, "train_code": 763, "train_name": "Chitra Express", "stations": [20, 32, 5, 38, 14]},
    {"route_id": 121, "train_code": 764, "train_name": "Chitra Express", "stations": [14, 38, 5, 32, 20]},
    {"route_id": 138, "train_code": 765, "train_name": "Nilsagar Express", "stations": [20, 5, 38, 17, 44, 10]},
    {"route_id": 109, "train_code": 766, "train_name": "Nilsagar Express", "stations": [10, 44, 17, 38, 5, 20]},
    {"route_id": 130, "train_code": 769, "train_name": "Dhumketu Express", "stations": [14, 24, 41, 22, 20, 35]},
    {"route_id": 151, "train_code": 770, "train_name": "Dhumketu Express", "stations": [35, 20, 22, 41, 24, 14]},
    {"route_id": 131, "train_code": 771, "train_name": "Rangpur Express", "stations": [14, 24, 41, 22, 20, 35, 36]},
    {"route_id": 153, "train_code": 772, "train_name": "Rangpur Express", "stations": [36, 35, 20, 22, 41, 24, 14]},
    {"route_id": 133, "train_code": 773, "train_name": "Kalni Express", "stations": [14, 15, 43, 2, 16, 45, 31, 4, 1, 27, 12, 18, 40]},
    {"route_id": 157, "train_code": 774, "train_name": "Kalni Express", "stations": [40, 27, 1, 4, 45, 16, 15, 18, 12, 6, 31, 2, 43, 14]},
    {"route_id": 132, "train_code": 775, "train_name": "Sirajgonj Express", "stations": [14, 24, 41, 39]},
    {"route_id": 155, "train_code": 776, "train_name": "Sirajgonj Express", "stations": [39, 41, 24, 14]},
    {"route_id": 127, "train_code": 777, "train_name": "Haor Express", "stations": [14, 24, 41, 22, 20, 30, 29]},
    {"route_id": 147, "train_code": 778, "train_name": "Haor Express", "stations": [29, 30, 20, 22, 41, 24, 14]},
    {"route_id": 123, "train_code": 781, "train_name": "Kishoreganj Express", "stations": [14, 24, 41, 22, 20, 35, 5, 38, 26]},
    {"route_id": 143, "train_code": 782, "train_name": "Kishoreganj Express", "stations": [26, 38, 5, 35, 20, 22, 41, 24, 14]},
    {"route_id": 118, "train_code": 787, "train_name": "Shonar Bangla Express", "stations": [14, 15, 43, 2, 16, 45, 31, 4, 1, 27, 12, 18, 9]},
    {"route_id": 107, "train_code": 788, "train_name": "Shonar Bangla Express", "stations": [9, 18, 12, 27, 1, 4, 31, 45, 16, 2, 43, 15, 14]},
    {"route_id": 127, "train_code": 789, "train_name": "Mohangonj Express", "stations": [14, 24, 41, 22, 20, 30, 29]},
    {"route_id": 147, "train_code": 790, "train_name": "Mohangonj Express", "stations": [29, 30, 20, 22, 41, 24, 14]},
    {"route_id": 105, "train_code": 791, "train_name": "Banalata Express", "stations": [8, 20, 35, 5, 38, 17, 14]},
    {"route_id": 117, "train_code": 792, "train_name": "Banalata Express", "stations": [14, 17, 38, 5, 35, 20, 8]},
    {"route_id": 129, "train_code": 793, "train_name": "Panchagarh Express", "stations": [14, 24, 41, 22, 34]},
    {"route_id": 149, "train_code": 794, "train_name": "Panchagarh Express", "stations": [34, 22, 41, 24, 14]},
    {"route_id": 116, "train_code": 795, "train_name": "Benapole Express", "stations": [14, 23, 25, 3]},
    {"route_id": 103, "train_code": 796, "train_name": "Benapole Express", "stations": [3, 25, 23, 14]},
    {"route_id": 141, "train_code": 800, "train_name": "Jamalpur Express", "stations": [21, 30, 26, 41, 14]},
    {"route_id": 107, "train_code": 703, "train_name": "Mohanagar Godhuli", "stations": [9, 18, 12, 27, 1, 4, 31, 45, 16, 2, 43, 15, 14]},
    {"route_id": 118, "train_code": 704, "train_name": "Mohanagar Provati", "stations": [14, 15, 43, 2, 16, 45, 31, 4, 1, 27, 12, 18, 9]},
    {"route_id": 133, "train_code": 717, "train_name": "Joyantika Express", "stations": [14, 15, 43, 2, 16, 45, 31, 4, 1, 27, 12, 18, 40]},
    {"route_id": 106, "train_code": 729, "train_name": "Meghna Express", "stations": [9, 6, 16, 2, 43, 14, 15, 45, 4, 1, 27, 12, 18, 7]},
    {"route_id": 134, "train_code": 735, "train_name": "Agnibina Express", "stations": [14, 24, 41, 22, 20, 35, 5, 38, 42]},
    {"route_id": 158, "train_code": 736, "train_name": "Agnibina Express", "stations": [42, 38, 5, 35, 20, 22, 41, 24, 14]},
    {"route_id": 143, "train_code": 738, "train_name": "Egarosindhur Provati", "stations": [26, 38, 5, 35, 20, 22, 41, 24, 14]},
    {"route_id": 157, "train_code": 740, "train_name": "Upaban Express", "stations": [40, 27, 1, 4, 45, 16, 15, 18, 12, 6, 31, 2, 43, 14]},
    {"route_id": 107, "train_code": 741, "train_name": "Turna Express", "stations": [9, 18, 12, 27, 1, 4, 31, 45, 16, 2, 43, 15, 14]},
    {"route_id": 118, "train_code": 742, "train_name": "Turna Express", "stations": [14, 15, 43, 2, 16, 45, 31, 4, 1, 27, 12, 18, 9]},
    {"route_id": 119, "train_code": 743, "train_name": "Brahmaputra Express", "stations": [14, 15, 24, 19, 30, 21, 13]},
    {"route_id": 115, "train_code": 744, "train_name": "Brahmaputra Express", "stations": [13, 21, 30, 19, 24, 15, 14]},
    {"route_id": 134, "train_code": 745, "train_name": "Jamuna Express", "stations": [14, 24, 41, 22, 20, 35, 5, 38, 42]},
    {"route_id": 158, "train_code": 746, "train_name": "Jamuna Express", "stations": [42, 38, 5, 35, 20, 22, 41, 24, 14]},
    {"route_id": 142, "train_code": 747, "train_name": "Simanta Express", "stations": [25, 23, 11, 35, 5, 38, 17, 10]},
    {"route_id": 110, "train_code": 748, "train_name": "Simanta Express", "stations": [10, 17, 38, 5, 35, 11, 23, 25]},
    {"route_id": 123, "train_code": 749, "train_name": "Egarosindhur Godhuli", "stations": [14, 24, 41, 22, 20, 35, 5, 38, 26]},
    {"route_id": 120, "train_code": 757, "train_name": "Drutojan Express", "stations": [14, 24, 41, 22, 20, 35, 5, 38, 17]},
    {"route_id": 136, "train_code": 758, "train_name": "Drutojan Express", "stations": [17, 38, 5, 35, 20, 22, 41, 24, 14]},
    {"route_id": 154, "train_code": 767, "train_name": "Dolonchapa Express", "stations": [38, 5, 17]},
    {"route_id": 137, "train_code": 768, "train_name": "Dolonchapa Express", "stations": [17, 5, 38]},
    {"route_id": 125, "train_code": 779, "train_name": "Dhalarchar Express", "stations": [14, 15, 43, 2, 16, 45, 31, 4, 1, 27]},
    {"route_id": 145, "train_code": 780, "train_name": "Dhalarchar Express", "stations": [27, 1, 4, 31, 45, 16, 2, 43, 15, 14]},
    {"route_id": 135, "train_code": 783, "train_name": "Tungipara Express", "stations": [14, 24, 41, 22, 20, 35, 5, 38, 46]},
    {"route_id": 159, "train_code": 784, "train_name": "Tungipara Express", "stations": [46, 38, 5, 35, 20, 22, 41, 24, 14]},
    {"route_id": 118, "train_code": 785, "train_name": "Bijoy Express", "stations": [14, 15, 43, 2, 16, 45, 31, 4, 1, 27, 12, 18, 9]},
    {"route_id": 107, "train_code": 786, "train_name": "Bijoy Express", "stations": [9, 18, 12, 27, 1, 4, 31, 45, 16, 2, 43, 15, 14]}
]

def add_minutes(time_str, minutes_to_add):
    """Add given minutes to HH:MM time string."""
    hours, minutes = map(int, time_str.split(':'))
    total_minutes = hours * 60 + minutes + minutes_to_add
    total_minutes %= 24 * 60  # wrap around 24 hours
    new_hours = total_minutes // 60
    new_minutes = total_minutes % 60
    return f"{new_hours:02d}:{new_minutes:02d}"

def generate_timetable(trains):
    timetable = []
    
    for train in trains:
        # Generate a random start time between '00:00' and '23:30'
        start_hour = random.randint(0, 23)
        start_minute = random.choice([0, 30])
        current_arrival = f"{start_hour:02d}:{start_minute:02d}"

        stations = train["stations"]
        
        for i, station_id in enumerate(stations):
            arrival_time = current_arrival
            # Departure is 5 minutes after arrival (except last station has no departure)
            departure_time = add_minutes(arrival_time, 5) if i < len(stations) - 1 else ""

            timetable.append({
                "route_id": train["route_id"],
                "train_code": train["train_code"],
                "station_id": station_id,
                "arrival_time": arrival_time,
                "departure_time": departure_time
            })

            # For next station: arrival is 30 minutes after current departure (skip if last station)
            if i < len(stations) - 1:
                current_arrival = add_minutes(departure_time, 30)
    
    return timetable

# Generate timetable
timetable_data = generate_timetable(trains)

# Write to CSV
with open('train_timetable.csv', 'w', newline='') as csvfile:
    fieldnames = ['route_id', 'train_code', 'station_id', 'arrival_time', 'departure_time']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    
    writer.writeheader()
    for row in timetable_data:
        writer.writerow(row)

print("Timetable generated successfully!")
