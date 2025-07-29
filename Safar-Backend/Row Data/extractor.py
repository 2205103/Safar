import csv

def generate_insert_statement():
    csv_file = input("Enter CSV file name: ").strip()
    n = int(input("Enter total columns: ").strip())

    csv_columns = []
    pg_columns = []

    print(f"Enter {n} lines of 'csv_column_name postgres_column_name':")
    for _ in range(n):
        line = input().strip()
        csv_col, pg_col = line.split()
        csv_columns.append(csv_col)
        pg_columns.append(pg_col)

    table_name = input("Enter PostgreSQL table name: ").strip()

    # Read the CSV file and extract relevant columns
    rows = []
    with open(csv_file, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Extract values in the order of csv_columns
            values = []
            for col in csv_columns:
                val = row[col]
                # Escape single quotes by doubling them for SQL
                val = val.replace("'", "''")
                # Wrap with single quotes, or use '00:00' if empty
                if val == '':
                    values.append("'00:00'")
                else:
                    values.append(f"'{val}'")
            rows.append(f"({', '.join(values)})")

    # Compose the INSERT INTO statement
    pg_columns_str = ", ".join(pg_columns)
    values_str = ",\n".join(rows)

    insert_stmt = f"INSERT INTO {table_name} ({pg_columns_str}) VALUES\n{values_str};"

    # Write to output.sql
    with open("output.sql", "w", encoding='utf-8') as f:
        f.write(insert_stmt + "\n")

    print("INSERT statement written to output.sql")

if __name__ == "__main__":
    generate_insert_statement()
