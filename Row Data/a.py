import csv

input_csv = "input.csv"  # your input CSV filename
output_csv = "unique_station_pairs.csv"

seen_pairs = set()
unique_pairs = []

# Read routes from CSV (assuming a column named 'list')
with open(input_csv, newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        route_str = row['list']
        stations = list(map(int, route_str.strip().split()))
        for i in range(len(stations) - 1):
            a, b = stations[i], stations[i + 1]
            pair = tuple(sorted((a, b)))  # unordered pair to avoid duplicates reversed
            if pair not in seen_pairs:
                seen_pairs.add(pair)
                unique_pairs.append(pair)

# Write unique pairs to output CSV
with open(output_csv, "w", newline='') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(["from", "to", "index"])
    for idx, (a, b) in enumerate(unique_pairs, start=1):
        writer.writerow([a, b, idx])

print(f"✅ Done! Saved {len(unique_pairs)} unique pairs to '{output_csv}'.")
