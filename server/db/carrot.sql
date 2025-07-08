CREATE TABLE passenger (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    address VARCHAR(255),
    birth_registration_number VARCHAR(20),
    post_code VARCHAR(10),
    password VARCHAR(100) NOT NULL,
    nid_number VARCHAR(20),  
    CHECK (
        NOT (nid_number IS NULL AND birth_registration_number IS NULL)
    )
);


CREATE TABLE class (
    class_id INTEGER PRIMARY KEY,
    class_name VARCHAR(50) UNIQUE NOT NULL
);


CREATE TABLE station (
    station_id INTEGER PRIMARY KEY,
    station_name VARCHAR(50) UNIQUE NOT NULL
);


CREATE TABLE boarding_station (
    b_station_id INTEGER PRIMARY KEY,
    b_station_name VARCHAR(50) NOT NULL, 
    station_id INTEGER REFERENCES station(station_id),
    UNIQUE (b_station_name, station_id)
);
-- a station/location can have multiple boarding stations

CREATE TABLE train (
    train_id INTEGER PRIMARY KEY,
    train_name VARCHAR(50) NOT NULL
);

CREATE TABLE route(
    route_id INTEGER PRIMARY KEY,
    route_name VARCHAR(50) NOT NULL
);

CREATE TABLE route_stations (
    route_id INTEGER REFERENCES route(route_id),
    station_id INTEGER REFERENCES station(station_id),
    sequence_number INTEGER,
    PRIMARY KEY (route_id, station_id)
);

-- route holds the sequence of the stations in a route
-- a route can have multiple stations, and their sequence in that route is stored (M to M)

CREATE TABLE train_routes(
    train_id INTEGER REFERENCES train(train_id),
    route_id INTEGER REFERENCES route(route_id),
    PRIMARY KEY (train_id, route_id)
);
-- route holds the sequence of the stations in a route
-- a route can have multiple stations, and their sequence in that route is stored (M to M)


-- train route maps the route to train
-- a train can have multiple routes, and a route can have multiple trains (M to M)




CREATE TABLE fareList (
    class_id INTEGER REFERENCES class(class_id),
    source INTEGER REFERENCES station(station_id),
    destination INTEGER REFERENCES station(station_id),
    fare DECIMAL(7,2), 
    PRIMARY KEY (class_id, source, destination)
);



CREATE TABLE Schedule (
    train_id INTEGER REFERENCES train(train_id),
    station_id INTEGER REFERENCES station(station_id),
    route_id INTEGER REFERENCES route(route_id),
    arrival TIME,
    departure TIME,
    PRIMARY KEY (train_id, station_id, route_id)
);


CREATE TABLE seat (
    seat_id SERIAL PRIMARY KEY,
    train_id INTEGER REFERENCES train(train_id),
    class_id INTEGER REFERENCES class(class_id),
    route_id INTEGER REFERENCES route(route_id),
    seat_number VARCHAR(10),
    UNIQUE (train_id, class_id, route_id, seat_number)
);
-- holds the seat information
CREATE TABLE seat_availability (
    seat_id INTEGER REFERENCES seat(seat_id),
    travel_date DATE,
    station_id INTEGER REFERENCES station(station_id),
    available BOOLEAN,
    PRIMARY KEY (seat_id, station_id, travel_date)
);

CREATE TABLE offer (
    offer_id SERIAL PRIMARY KEY,
    offer_criteria VARCHAR(100) NOT NULL,
    offer_description VARCHAR(255) NOT NULL,
    offer_pct DECIMAL(5, 2) NOT NULL
);



CREATE TABLE transaction (
    transaction_id INTEGER PRIMARY KEY,
    mode_of_transaction VARCHAR(50) NOT NULL,
    offer_id INTEGER REFERENCES offer(offer_id),
    transaction_time TIMESTAMP,
    amount DECIMAL(10, 2) NOT NULL
);


CREATE TABLE ticket (
    ticket_id VARCHAR(15) PRIMARY KEY,
    user_id INTEGER REFERENCES passenger(user_id),
    boarding_station_id INTEGER REFERENCES boarding_station(b_station_id),
    destination_station_id INTEGER REFERENCES boarding_station(b_station_id),
    total_fare DECIMAL(10, 2) NOT NULL,
    travel_status VARCHAR(20),
    transaction_id INTEGER REFERENCES transaction(transaction_id)
    
);



CREATE TABLE review (
    review_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES passenger(user_id),
    ticket_id VARCHAR(15) REFERENCES ticket(ticket_id),
    train_id INTEGER REFERENCES train(train_id),
    class_id INTEGER REFERENCES class(class_id),
    review_content VARCHAR(100),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL
);



CREATE TABLE refund (
    refund_id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES transaction(transaction_id),
    refund_time TIMESTAMP,
    refund_amount DECIMAL(10, 2) NOT NULL
);
CREATE TABLE train_class(
    train_id INTEGER REFERENCES train(train_id),
    class_id INTEGER REFERENCES class(class_id),
    PRIMARY KEY (train_id, class_id)
)